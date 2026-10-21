# CachyOS / Arch: packages, updates, snapshots, recovery

What is verified on this machine (via `scripts/sysinfo.sh` and local files) is marked **(local)**. Arch policies that could not be re-read in this session (ArchWiki blocks automated fetches) are marked **(Arch policy)**. Community reports are marked **(community, unverified)**.

## Package sources, in order of preference

| Source | Tool | Use for | Notes |
|---|---|---|---|
| CachyOS + Arch repos | `pacman` | almost everything | CachyOS repos (`cachyos-v4`, `cachyos-core-v4`, `cachyos-extra-v4`) come first in `pacman.conf` and carry CPU-optimised builds **(local)** |
| Flathub | `flatpak` | sandboxed GUI apps, proprietary apps | separate update path: `flatpak update` |
| AUR | `paru` (also `yay`) | software not in repos | run as the normal user, never with sudo; read the PKGBUILD before the first install; AUR packages are user-produced and unreviewed **(Arch policy)** |

Search before installing: `pacman -Ss <name>`, `paru -Ss <name>`, `flatpak search <name>`. Prefer the repo package when it exists.

## Updates

- Full system upgrade only: `sudo pacman -Syu` (or `paru` for repos + AUR). **Never** `pacman -Sy <pkg>` or refreshing databases without upgrading: partial upgrades are unsupported and can break library dependencies **(Arch policy)**.
- Installing a new package on an out-of-date system: upgrade first, or use `sudo pacman -Syu <pkg>`.
- Before a big upgrade, check for manual-intervention news: `paru -Pw` prints unread Arch news **(local: paru supports -P/--show)**.
- After upgrading:
  - Merge config changes: `.pacnew` files are new upstream defaults that pacman did not apply because you changed the file. List with `pacdiff -o`, merge with `sudo DIFFPROG='diff -u' pacdiff` or an interactive diff tool **(local: pacdiff v1.13.1 help)**. Do not delete `.pacnew` files without reviewing them.
  - **Never replace `/etc/pacman.conf` with `pacman.conf.pacnew` wholesale.** The `.pacnew` is the plain Arch default without the CachyOS repositories (local check: 4 `[cachyos*]` sections in `pacman.conf`, 0 in the `.pacnew`). Applying it would silently switch the system to generic Arch packages. Merge only option changes, keep the CachyOS repo sections.
  - **Mirrorlist `.pacnew` files must not be copied over blindly either.** The Arch `mirrorlist.pacnew` ships with every server commented out (local check: 0 active `Server` lines vs 52 in the live file), so replacing the live file leaves the Arch repos with no mirror. Regenerate mirror lists with `cachyos-rate-mirrors` instead and then delete the `.pacnew`. Always count active lines before replacing any list file: `grep -c '^Server' <file>`.
  - `resolv.conf`, `locale.gen`, and tool configs (e.g. `limine-snapper-sync.conf`) need a real diff and a merge of the new options.
  - Reboot after kernel, systemd, mesa, or glibc updates.
  - Check `systemctl --failed` and `journalctl -b -p err`.
- Orphans: `pacman -Qdtq` lists packages no longer required; review before `sudo pacman -Rns $(pacman -Qdtq)` (fish: `sudo pacman -Rns (pacman -Qdtq)`).
- Package cache: `paccache -rk2` keeps the last 2 versions (pacman-contrib) **(local: installed)**.

## Snapshots and recovery (btrfs + snapper + Limine)

On this machine **(local)**: root is btrfs (`/@`), snapper has a `root` config, and `snap-pac`, `limine-snapper-sync`, `limine-mkinitcpio-hook`, `btrfs-assistant` are installed. pacman hooks include `05-snap-pac-pre`, `zz-snap-pac-post`, `10-limine-snapper-lock`, `80-limine-efi-deploy`.

What this gives you:

- Every pacman transaction creates a **pre and post snapshot** automatically (snap-pac).
- limine-snapper-sync adds **bootable snapshot entries** to the Limine menu, with a copy of the kernel for each snapshot **(community, consistent with the hooks present)**.

Before a risky change that pacman does not cover (editing `/etc`, bootloader, fstab, drivers):

```fish
sudo snapper -c root create -d "before <change>"
```

If the system breaks:

1. Boot the last good snapshot from the Limine menu (read-only boot to confirm it works).
2. Restore it with btrfs-assistant (GUI) or follow the CachyOS documentation for rollback.
3. Small mistakes in config files can be reverted without a full rollback: `sudo snapper -c root undochange <pre>..<post> <path>`.

Caveats **(community, unverified)**: kernels live on the FAT32 ESP and are not inside btrfs snapshots; a rollback can leave `/boot` out of sync. CachyOS forum users report that a plain `snapper rollback` may not take effect because fstab mounts `subvol=/@` explicitly. Treat rollback as a procedure to check against current CachyOS docs before running, and keep a CachyOS live USB for chroot recovery.

## Services and logs

| Need | Command |
|---|---|
| failed units | `systemctl --failed`, `systemctl --user --failed` |
| errors this boot | `journalctl -b -p err` |
| one service | `systemctl status <unit>`, `journalctl -u <unit> -b` |
| previous boot (after a crash) | `journalctl -b -1 -p warning` |
| enable/start | `sudo systemctl enable --now <unit>` (user units: `systemctl --user enable --now <unit>`, no sudo) |

## Mirrors

CachyOS ships `cachyos-rate-mirrors` (ranks CachyOS and Arch mirrors) and `reflector` **(local: both installed)**. Regenerate with these tools rather than copying a mirrorlist `.pacnew` into place (see the warning above).
