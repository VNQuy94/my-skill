#!/usr/bin/env bash
# Read-only snapshot of this Linux desktop. Run it before proposing any change.
# Needs no root and changes nothing. Usage: scripts/sysinfo.sh [--updates]
#   --updates  also count pending repo/AUR updates (network access, a few seconds)
set -uo pipefail

have() { command -v "$1" >/dev/null 2>&1; }
section() { printf '\n== %s\n' "$1"; }

section "System"
. /etc/os-release 2>/dev/null && echo "distro:   ${PRETTY_NAME:-?} (id=${ID:-?}, like=${ID_LIKE:-?})"
echo "kernel:   $(uname -r)"
echo "desktop:  ${XDG_CURRENT_DESKTOP:-?}  session: ${XDG_SESSION_TYPE:-?}  wayland: ${WAYLAND_DISPLAY:-no}  x11: ${DISPLAY:-no}"
echo "login shell: $(getent passwd "$USER" | cut -d: -f7)  (commands for the user must work in this shell)"
if have systemctl; then echo "display manager: $(systemctl show -p Id --value display-manager 2>/dev/null || echo ?)"; fi
if sudo -n true 2>/dev/null; then echo "sudo: passwordless (still ask before root changes)"; else echo "sudo: needs a password — the user must run root commands themselves"; fi

section "Packages"
for t in pacman paru yay flatpak snap apt dnf zypper; do have "$t" && printf '%s ' "$t"; done; echo
if have pacman; then
  echo "installed: $(pacman -Qq | wc -l) (explicit: $(pacman -Qqe | wc -l), foreign/AUR: $(pacman -Qqm | wc -l))"
  echo "repos: $(grep -E '^\[' /etc/pacman.conf | grep -v options | tr -d '[]' | tr '\n' ' ')"
  orphans=$(pacman -Qqdt 2>/dev/null | wc -l); echo "orphans: $orphans"
fi
if have flatpak; then echo "flatpak apps: $(flatpak list --app --columns=application 2>/dev/null | wc -l)"; fi
if [[ "${1:-}" == "--updates" ]]; then
  have checkupdates && echo "repo updates pending: $(checkupdates 2>/dev/null | wc -l)"
  have paru && echo "AUR updates pending: $(paru -Qua 2>/dev/null | wc -l)"
fi

section "Config files waiting for a merge (.pacnew/.pacsave)"
found=$(find /etc -xdev \( -name '*.pacnew' -o -name '*.pacsave' \) 2>/dev/null)
if [[ -n "$found" ]]; then
  while read -r f; do
    note=""
    case "$f" in
      *mirrorlist.pacnew) live="${f%.pacnew}"; note="  (active servers: new $(grep -c '^Server' "$f" 2>/dev/null), live $(grep -c '^Server' "$live" 2>/dev/null))" ;;
      */pacman.conf.pacnew) note="  (repo sections: new $(grep -c '^\[' "$f"), live $(grep -c '^\[' /etc/pacman.conf); CachyOS repos in new: $(grep -c '^\[cachyos' "$f"))" ;;
    esac
    echo "$f$note"
  done <<< "$found"
  echo "→ review each with a diff before merging: pacdiff -o lists them; never copy a .pacnew over blindly"
else echo "none"; fi

section "Storage and snapshots"
echo "root fs: $(findmnt -no FSTYPE /) on $(findmnt -no SOURCE /)"
df -h / /home 2>/dev/null | awk 'NR==1 || !seen[$1]++'
if have snapper; then
  snapper list-configs 2>/dev/null | tail -n +3 | awk '{print "snapper config:", $1, $3}'
  last=$(snapper -c root list 2>/dev/null | tail -n 3)
  [[ -n "$last" ]] && { echo "latest root snapshots:"; echo "$last"; }
fi
for p in snap-pac limine-snapper-sync btrfs-assistant timeshift; do
  have pacman && pacman -Q "$p" >/dev/null 2>&1 && echo "installed: $p"
done

section "Boot"
if have limine; then echo "bootloader: limine"; elif [[ -d /boot/grub ]]; then echo "bootloader: grub"; elif have bootctl && bootctl is-installed >/dev/null 2>&1; then echo "bootloader: systemd-boot"; else echo "bootloader: ?"; fi
echo "boot mode: $([[ -d /sys/firmware/efi ]] && echo UEFI || echo BIOS)"

section "Health"
if have systemctl; then
  failed=$(systemctl --failed --no-legend 2>/dev/null); echo "failed system units: ${failed:-none}"
  ufailed=$(systemctl --user --failed --no-legend 2>/dev/null); echo "failed user units: ${ufailed:-none}"
fi
if have journalctl; then
  n=$(journalctl -b -p err --no-pager -q 2>/dev/null | wc -l)
  echo "errors in this boot's journal (readable without root): $n  → journalctl -b -p err"
fi

section "Desktop integration"
for f in /usr/share/xdg-desktop-portal/portals/*.portal; do
  [[ -e "$f" ]] || continue
  name=$(basename "$f" .portal)
  ifs=$(grep -m1 '^Interfaces=' "$f" | cut -d= -f2 | tr ';' '\n' | sed 's/org.freedesktop.impl.portal.//' | grep -v '^$' | tr '\n' ' ')
  echo "portal $name: $ifs"
done
have pipewire && echo "audio: pipewire $(pipewire --version 2>/dev/null | tail -1 | awk '{print $NF}')"
