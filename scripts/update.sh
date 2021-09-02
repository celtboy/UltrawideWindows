#!/bin/sh
killall kwin
DISPLAY=:0 kwin

sed -i '/UltrawideWindows/d' ~/.config/kglobalshortcutsrc
kquitapp5 kglobalaccel && sleep 2s && kglobalaccel5 &
kwin &
plasmapkg2 --type=kwinscript -r .
zip -r movewindowtocenter.kwinscript contents/ LICENSE metadata.desktop
plasmapkg2 --type=kwinscript -i .
kwin_x11 --replace &
