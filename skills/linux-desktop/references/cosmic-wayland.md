# COSMIC on Wayland: what works, what does not, and why

## Facts

| Fact | Evidence |
|---|---|
| COSMIC runs only as a Wayland session; there is no X11 COSMIC session | local: `/usr/share/wayland-sessions/cosmic.desktop` exists, `/usr/share/xsessions/` does not; Fedora forum reply says COSMIC is Wayland-only with Xwayland for X11 apps (community) |
| X11 applications run through Xwayland | local: `xorg-xwayland` installed, `DISPLAY=:1` set in the session |
| Screen sharing and remote control go through xdg-desktop-portal | local: `cosmic.portal` implements `ScreenCast` and `RemoteDesktop` (also `Screenshot`, `FileChooser`, `Settings`, `Access`) |
| Portal selection | local: `portals.conf` prefers `cosmic;gtk` |

Consequence: "switch app X to X11" usually means one of two different things. Find out which before acting:

1. **Run one app under Xwayland** (the app's own window misbehaves on Wayland): start it with the toolkit's X11 backend, nothing else changes.
   - GTK: `env GDK_BACKEND=x11 <app>`
   - Qt: `env QT_QPA_PLATFORM=xcb <app>`
   - Electron/Chromium: `<app> --ozone-platform=x11`
   - Make it permanent with a user `.desktop` override in `~/.local/share/applications/` (copy the system file, edit `Exec=`). Never edit files under `/usr/share`.
2. **Capture or control the whole desktop as X11 tools expect** (screen recorders, remote-desktop hosts, input automation). Under Wayland these must use the portal. An X11 app on Xwayland can only see other X11 windows, not the desktop. A real X11 session needs a different desktop (e.g. Xfce or Plasma X11) installed alongside COSMIC and selected at the SDDM login screen.

## Remote desktop (RustDesk and similar)

- On Wayland, RustDesk captures the screen via the portal and PipeWire and injects input via uinput; the first share in a session needs an on-screen confirmation (RustDesk "RustDesk for Linux" guide, as summarised in search results; not opened directly).
- COSMIC's portal provides the needed `ScreenCast` and `RemoteDesktop` interfaces (local), so the Wayland path should work for an attended session.
- Unattended access, including the login screen, on Wayland was announced as a RustDesk preview in August 2026 for Debian/Ubuntu first, with Arch planned later (news coverage, unverified against RustDesk's own announcement). Check the current RustDesk release notes before promising unattended access.
- If unattended access is required today, options are: an X11 desktop session for remote use, or a headless/virtual display setup per RustDesk's docs. Each has trade-offs; present them to the user rather than choosing.
- Using this machine to control **other** machines does not need any of this; only the RustDesk window itself is involved (option 1 above if it misbehaves).

## Useful checks

```fish
echo $XDG_SESSION_TYPE $XDG_CURRENT_DESKTOP     # wayland COSMIC
cat /usr/share/xdg-desktop-portal/portals/cosmic.portal
systemctl --user status xdg-desktop-portal
xlsclients 2>/dev/null                          # which apps run under Xwayland (if xorg-xlsclients is installed)
```
