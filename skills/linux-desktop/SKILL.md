---
name: linux-desktop
description: Safely inspect, configure, update, and troubleshoot the user's own Linux desktop — CachyOS/Arch (pacman, paru, flatpak, .pacnew merges, btrfs + snapper + Limine snapshots) on the COSMIC Wayland desktop (portals, Xwayland, screen sharing, remote desktop such as RustDesk). Use it whenever the user asks to install or remove software, update the system, fix something broken (app, audio, display, network, boot), change a system setting or service, switch an app between Wayland and X11, set up remote access, or "cài", "gỡ", "cập nhật", "sửa lỗi", "cấu hình" anything on their machine. Inspect first, change only with the user's go-ahead, and hand root commands to the user.
---

# linux-desktop

Changes to a running system are hard to undo and the user lives on this machine. Three things go wrong most often: acting on assumptions about the system instead of checking it, running root commands the agent cannot or should not run, and fixing the wrong problem (e.g. "switch RustDesk to X11" when the real need is screen sharing on Wayland). This skill puts inspection, consent, and reversibility first.

`<skill>` = this skill's directory.

## Workflow

### 1. Inspect before proposing anything

```bash
<skill>/scripts/sysinfo.sh            # read-only: distro, session, shell, sudo, packages, .pacnew, snapshots, boot, failed units, portals
<skill>/scripts/sysinfo.sh --updates  # also count pending updates
```

Then read whatever is specific to the problem: `systemctl status <unit>`, `journalctl -b -p err`, `journalctl --user -b`, the app's own log, `pacman -Qi <pkg>`, config files. Quote the evidence in your answer.

### 2. Clarify the actual goal

Restate what the user wants to achieve, not just the mechanism they named, when the two can differ. Example: on COSMIC there is no X11 session, so "use X11" can mean "fix one app's window" (run it under Xwayland) or "let others control my screen" (use the portal) or "install an X11 desktop" (a big change). Read `references/cosmic-wayland.md` for display, portal, and remote-desktop questions.

### 3. Propose a plan, then wait

For anything that changes the system, present:

- what will change and why, with the evidence from step 1;
- the exact commands;
- how to undo it (snapshot, backup copy, package to remove);
- risks (reboot needed, network, data).

Read-only commands may run without asking. Changes need the user's go-ahead in this conversation.

### 4. Root commands go to the user

`sudo` on this machine requires a password, and the agent must never handle passwords (no `sudo -S`, no echoing passwords, no asking for them). Give root commands to the user to run themselves with the `!` prefix in Claude Code, grouped in the order to run, one purpose per line:

```text
! sudo snapper -c root create -d "before pipewire config change"
! sudo cp /etc/pipewire/pipewire.conf /etc/pipewire/pipewire.conf.bak
```

`!` is Claude Code's prefix for running a command in this session; the text after it is what runs in the user's shell, so it must be valid fish. Then read the output before continuing.

### 5. Make changes reversible

- Before a risky change outside pacman (files in `/etc`, bootloader, fstab, drivers, kernel parameters): take a snapper snapshot, and copy the file to `<file>.bak.<date>`.
- pacman transactions already get pre/post snapshots (snap-pac) and bootable Limine entries; mention that when proposing package changes. Details and caveats: `references/cachyos.md`.
- Prefer user-level changes (`~/.config`, `~/.local/share/applications`, `systemctl --user`) over system-wide ones.
- Never edit files under `/usr` directly; use overrides (`/etc/...`, drop-in `*.d/` directories, user `.desktop` copies).

### 6. Verify and report

After the change, re-run the relevant check (service status, `systemctl --failed`, the app itself) and report what changed, where the backup or snapshot is, and how to undo it.

## Rules for this machine

| Topic | Rule |
|---|---|
| Shell | The user's login shell is **fish**: commands for the user must be fish-compatible (`set -x VAR value` or `env VAR=value cmd`, no `export`, no heredocs, `(cmd)` for substitution). Your own Bash tool may run a different shell. |
| Packages | repo (`pacman`) → Flathub (`flatpak`) → AUR (`paru`, never with sudo, read the PKGBUILD first). Full upgrades only: `pacman -Syu`; never `pacman -Sy <pkg>`. |
| After upgrades | merge `.pacnew` files with `pacdiff`; never copy one over the live file without diffing (the Arch `pacman.conf.pacnew` drops the CachyOS repos, the Arch `mirrorlist.pacnew` has no active servers); reboot after kernel/systemd/mesa/glibc updates; check `systemctl --failed`. |
| Snapshots | btrfs + snapper (`root` config) + snap-pac + limine-snapper-sync are installed. Rollback has known caveats with `/boot` on the ESP; see `references/cachyos.md` before advising one. |
| Desktop | COSMIC is Wayland-only. Screen capture and remote control go through `xdg-desktop-portal-cosmic` (ScreenCast, RemoteDesktop). |
| Unknowns | When a fix depends on current upstream behavior (a package version, a known bug, a release with a new feature), check it with the `research` skill instead of answering from memory. |
| Do not touch | `~/.claude/skills/synced/` (synced by claude.ai); disk partitioning, bootloader, fstab, or encryption without an explicit request and a snapshot; other users' files. |

## Files

| Path | Purpose |
|---|---|
| `scripts/sysinfo.sh` | read-only system snapshot |
| `references/cachyos.md` | package sources, upgrades, .pacnew, orphans, snapper/Limine recovery, services and logs |
| `references/cosmic-wayland.md` | Wayland vs X11 on COSMIC, per-app Xwayland, portals, remote desktop (RustDesk) |
