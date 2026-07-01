# Power Studio

This module lets you control Power Studio from Bitfocus Companion.

Use it to build Stream Deck pages for playout transport, cart players, playlist set-next control, the mix editor and the recorder. The module also reads status from Power Studio, so buttons can change color and show the current artist, title or cart name.

## About Power Studio

Power Studio is broadcast radio automation software from HOPLA Productions.

It is designed as a complete radio workflow system: playout, music scheduling, voice tracking, automatic content ingestion, commercial planning, news bulletin building and integration with studio hardware or content providers all live in the Power Studio ecosystem.

This Companion module focuses on the parts that make sense on a button surface during live operation:

- Player transport.
- Cart player control.
- Playlist set-next control.
- Mix editor transport.
- Recorder transport and recording control.
- Visual status feedback on buttons.
- Trigger-friendly variables and feedbacks for Companion automation.

More information about Power Studio is available at [power-studio.nl](https://www.power-studio.nl/).

## Version History

### Version 1.0.1

- Addressed Bitfocus review feedback.
- Switched the module to Yarn lockfile/package-manager metadata.
- Removed the local Companion tools patch script.
- Improved polling so status refreshes no longer overlap.
- Raised the poll interval defaults to reduce load while keeping button state responsive.
- Added stricter validation and variable support for the set-next-item action.

### Version 1.0.0

- First release.

## Setup

Add a Power Studio connection in Companion and enter the address of the Power Studio REST API.

- In Power Studio, configure and enable the REST API Plugin.
- Use the Power Studio host name or IP address.
- Set the API port to the same port number configured in the Power Studio REST API Plugin.
- The default REST API Plugin port is `9876`, and the Companion module uses `9876` as its default port too.
- Leave the path prefix empty unless the API is published behind a reverse proxy.
- Recommended: leave `Authenticate request using Basic Auth.` disabled in the Power Studio REST API Plugin.
- Recommended: leave the module `Username` and `Password` fields empty.
- When Basic Auth is disabled, the REST API uses the credentials of the user currently logged into Power Studio. If no user is logged into Power Studio, authorization fails with HTTP `401`.
- When Basic Auth is enabled, enter the module username and password. The module can then authenticate even when no user is logged into Power Studio, but Playout, Carts, Mix Editor, Recorder and Playlist Window control cannot be operated until a user is logged into Power Studio.
- Keep the default poll interval of `500` ms unless you need faster or slower button updates. The minimum is `100` ms.
- Use the three title display options when long titles make buttons hard to read. They control cart rack presets, player transport presets and playlist window presets separately.

Power Studio version `1.24.1` or newer is required. If an older version is detected, the connection status shows `Power Studio version 1.24.1 or newer is required`.

When the connection is not OK, preset buttons turn dark gray. This includes missing configuration, a bad connection, authentication problems and unsupported Power Studio versions. Companion's own connection indicator shows authentication failures with a yellow/orange warning triangle and missing connections with a red warning triangle. While the module is disabled or restarting, presets use dark gray as their base color until feedbacks are active again.

When the connection is OK, start by dragging presets to buttons. Presets created with this module version include text feedback, so the title display options can be changed later and the placed buttons will update. The text feedback uses the current Companion connection label for variables, such as `$(Power_Studio:cart_a_slot_1_title)`. Buttons created with an older module version may need to be dragged from the preset list once more.

## Recommended Pages

A practical first layout is:

- One player transport page with Play, Cue or stop and PFL for Player A through Player D.
- One cart page with rack slots `1` through `7` for Cart A and Cart B.
- One mix editor page with play, stop, record, save, undo and mix navigation.
- One recorder page with play, stop, record and recorder profile navigation.
- One playlist page with 16 set-next buttons and previous/next/reset window buttons.
- One small diagnostics area showing connection status and the latest command error.

## Numbering

Power Studio names the players and carts with letters. The module shows those same names in presets, actions, feedbacks and variables.

| Item | Numbering |
| --- | --- |
| Playout players | Player A, Player B, Player C and Player D |
| Cart players | Cart A and Cart B |
| Cart rack slots | `1` through `7` |
| Playlist window items | `1` through `16` |

## Presets

Presets are the easiest way to build reliable buttons. They already include actions, text variables and feedback colors. All presets also include connection feedback, so they turn dark gray when Companion is not connected cleanly to Power Studio.

### Preset Overview

| Section | Presets |
| --- | --- |
| Playout players | `Player A Play`, `Player A Cue or stop`, `Player A PFL toggle`, repeated through Player D. |
| Playout control | `Refresh playout`, `Load next playlist`, `Automation mode`, `Live Assist mode`, `Training Mode`. |
| Carts | `Trigger Cart A slot 1` through `Trigger Cart A slot 7`, `Stop Cart A`, repeated for Cart B. |
| Mix Editor | `Mix play`, `Mix stop`, `Mix record`, `Mix save`, `Mix undo`, `Previous mix`, `Next mix`, `Previous profile`, `Next profile`, `Select profile`. |
| Recorder | `Recorder play`, `Recorder stop`, `Recorder toggle recording`, `Recorder start recording`, `Recorder stop recording`, `Recorder previous profile`, `Recorder next profile`, `Recorder select profile`. |
| Playlist Window | `Set next playlist window item 1` through `Set next playlist window item 16`, `Previous playlist window`, `Next playlist window`, `Reset playlist window`. |

### Player Transport

Each of the four players has:

| Preset | Function |
| --- | --- |
| `PLAY A` | Sends `Play` to Player A. |
| `CUE A` | Sends `Cue` when Player A is stopped or idle. Sends `Stop` when Player A is playing. |
| `PFL A` | Sends `PflToggle` to Player A. |

By default these presets show live artist and title below the button label. You can hide those title lines with the player transport title display option, leaving compact labels such as `PLAY A`, `CUE A` and `PFL A`.

Player colors:

| Button | Color | Meaning |
| --- | --- | --- |
| `PLAY` | Dark gray | Player is empty |
| `PLAY` | Dark gray | Power Studio is in Automation mode and this player is not playing; player transport is unavailable |
| `PLAY` | Blue | Player has an item loaded |
| `PLAY` | Yellow | Player is next |
| `PLAY` | Green | Player is playing, also when Power Studio is in Automation mode |
| `CUE` | Dark gray | Player is empty or already cued |
| `CUE` | Dark gray | Power Studio is in Automation mode; player transport is unavailable |
| `CUE` | Orange | Player is stopped but not cued; pressing cues the player |
| `CUE` | Red | Player is playing; pressing stops the player |
| `PFL` | Dark gray | PFL is inactive |
| `PFL` | Dark gray | Power Studio is in Automation mode; player transport is unavailable |
| `PFL` | Yellow | PFL is active |

When Power Studio is in Automation mode, non-playing player transport buttons become dark gray because they cannot be operated. A playing player still shows green on the Play preset, so you can see which player is currently on air. When the connection is not OK, dark gray wins over all player colors.

### Playout Control

| Preset | Function |
| --- | --- |
| `REFRESH PLAYOUT` | Refreshes the Power Studio playlist. |
| `NEXT PLAYLIST` | Loads the next playlist. |
| `AUTO` | Switches to Automation mode. |
| `LIVE ASSIST` | Switches to Live Assist mode. |
| `TRAINING MODE` | Switches to Training Mode. |

Playout control colors:

| Button | Color | Meaning |
| --- | --- | --- |
| `REFRESH PLAYOUT` | Blue | Connection is OK and the command is available |
| `NEXT PLAYLIST` | Blue | Connection is OK and the command is available |
| `AUTO` | Blue | Connection is OK and Automation mode is not active |
| `AUTO` | Yellow | Automation mode is active |
| `LIVE ASSIST` | Blue | Connection is OK and Live Assist mode is not active |
| `LIVE ASSIST` | Yellow | Live Assist mode is active |
| `TRAINING MODE` | Blue | Connection is OK and Training Mode is not active |
| `TRAINING MODE` | Yellow | Training Mode is active |

When the connection is not OK, dark gray wins over all playout control colors.

### Cart Rack

There are two cart players. Each cart player always has seven rack slots.

- Cart A: `CART A:1` through `CART A:7`
- Cart B: `CART B:1` through `CART B:7`

The button name stays tied to the rack position. By default the visible button text also follows the title currently loaded in that rack slot. This means you can keep the same Stream Deck page while Power Studio loads different carts. If long cart titles make the page hard to read, hide cart rack titles in the module configuration; the buttons then keep compact labels such as `CART A:1`.

Cart colors:

| Button | Color | Meaning |
| --- | --- | --- |
| `CART A:1` through `CART B:7` | Dark gray | Rack slot is empty or `None` |
| `CART A:1` through `CART B:7` | Blue | Rack slot is loaded |
| `CART A:1` through `CART B:7` | Yellow | Rack slot is selected |
| `CART A:1` through `CART B:7` | Green | Rack slot is playing |
| `CART A STOP` / `CART B STOP` | Dark gray | Cart player is not playing |
| `CART A STOP` / `CART B STOP` | Red | Cart player is playing |

When the connection is not OK, dark gray wins over all cart status colors.

### Mix Editor

| Preset | Function |
| --- | --- |
| `MIX PLAY` | Play in the mix editor. |
| `MIX STOP` | Stop mix editor playback or recording. |
| `MIX REC` | Start recording in the mix editor. |
| `MIX SAVE` | Save the current mix. |
| `MIX UNDO` | Undo the last mix editor change. |
| `PREV MIX` | Move to the previous mix. |
| `NEXT MIX` | Move to the next mix. |
| `PREV PROFILE` | Move to the previous profile. |
| `NEXT PROFILE` | Move to the next profile. |
| `SELECT PROFILE` | Select a profile. |

Mix editor colors:

| Button | Color | Meaning |
| --- | --- | --- |
| `MIX PLAY` | Dark gray | Play is unavailable |
| `MIX PLAY` | Blue | Play is available |
| `MIX PLAY` | Green | Mix editor is playing |
| `MIX STOP` | Dark gray | Stop is unavailable |
| `MIX STOP` | Red | Stop is available, playing, or recording |
| `MIX REC` | Dark gray | Record is unavailable |
| `MIX REC` | Blue | Record is available |
| `MIX REC` | Red | Mix editor is recording |
| `MIX SAVE` | Dark gray | Save is unavailable |
| `MIX SAVE` | Blue | Save is available |
| `MIX UNDO` | Dark gray | Undo is unavailable |
| `MIX UNDO` | Blue | Undo is available |
| `PREV MIX` | Dark gray | Previous mix is unavailable |
| `PREV MIX` | Blue | Previous mix is available |
| `NEXT MIX` | Dark gray | Next mix is unavailable |
| `NEXT MIX` | Blue | Next mix is available |
| `PREV PROFILE` / `NEXT PROFILE` / `SELECT PROFILE` | Blue | Connection is OK and the command is shown as available |

Profile navigation buttons turn blue when connected because the current Power Studio API does not report separate availability states for profile navigation.

When the connection is not OK, dark gray wins over the mix editor colors.

### Recorder

| Preset | Function |
| --- | --- |
| `REC PLAY` | Plays the current recorder item. |
| `REC STOP` | Stops recorder playback or recording. |
| `REC TOGGLE` | Toggles recorder recording. |
| `REC START` | Starts recorder recording. |
| `STOP REC` | Stops recorder recording. |
| `PREV PROFILE` | Moves to the previous recorder processing profile. |
| `NEXT PROFILE` | Moves to the next recorder processing profile. |
| `SELECT PROFILE` | Selects the currently previewed recorder processing profile. |

Recorder colors:

| Button | Color | Meaning |
| --- | --- | --- |
| `REC PLAY` | Dark gray | Play is unavailable |
| `REC PLAY` | Blue | Play is available |
| `REC PLAY` | Green | Recorder is playing |
| `REC STOP` | Dark gray | Stop is unavailable |
| `REC STOP` | Red | Stop is available, playing, or recording |
| `REC TOGGLE` | Dark gray | Recording cannot be started |
| `REC TOGGLE` | Blue | Recording can be started |
| `REC TOGGLE` | Red | Recorder is recording |
| `REC START` | Dark gray | Recording cannot be started |
| `REC START` | Blue | Recording can be started |
| `REC START` | Red | Recorder is already recording |
| `STOP REC` | Dark gray | Recorder is not recording |
| `STOP REC` | Red | Recorder is recording |
| `PREV PROFILE` / `NEXT PROFILE` / `SELECT PROFILE` | Dark gray | Processing profile changes are unavailable |
| `PREV PROFILE` / `NEXT PROFILE` / `SELECT PROFILE` | Blue | Processing profile changes are available |

When the connection is not OK, dark gray wins over the recorder colors.

### Playlist Window

The playlist window gives you 16 visible set-next buttons.

| Preset | Function |
| --- | --- |
| `NEXT 1` through `NEXT 16` | Sets the visible playlist item as next. |
| `PREV WINDOW` | Moves the visible window 16 items back. |
| `NEXT WINDOW` | Moves the visible window 16 items forward. |
| `RESET WINDOW` | Jumps back to the first playlist item. |

By default playlist buttons show artist and title below `NEXT 1` through `NEXT 16`. You can hide those title lines with the playlist window title display option. The color indicates the content type or active state.

| Button | Color | Meaning |
| --- | --- | --- |
| `NEXT 1` through `NEXT 16` | Dark gray | Empty or default |
| `NEXT 1` through `NEXT 16` | Blue | Track |
| `NEXT 1` through `NEXT 16` | Purple | Jingle |
| `NEXT 1` through `NEXT 16` | Cyan | Promo |
| `NEXT 1` through `NEXT 16` | Orange | Spot |
| `NEXT 1` through `NEXT 16` | Magenta | VoiceTrack |
| `NEXT 1` through `NEXT 16` | Slate gray | Misc |
| `NEXT 1` through `NEXT 16` | Yellow | Next item |
| `NEXT 1` through `NEXT 16` | Green | Currently playing |
| `PREV WINDOW` / `NEXT WINDOW` / `RESET WINDOW` | Blue | Connection is OK and the command is available |

When the connection is not OK, dark gray wins over the playlist item colors.

## Actions

Actions are available when you want to build your own buttons instead of starting from presets.

| Action | Options | What it does |
| --- | --- | --- |
| `Refresh cached status` | None | Polls Power Studio immediately and updates button feedbacks and variables. |
| `Playout: send player command` | Player A to Player D; command | Sends a transport or PFL command to a playout player. `Cue` uses the same smart cue-or-stop behavior as the Cue preset. |
| `Playout: cue or stop player` | Player A to Player D | Sends `Stop` when the player is playing, otherwise sends `Cue`. |
| `Playout: set mode` | Mode | Changes Power Studio playout mode. |
| `Playout: load next playlist` | None | Loads the next playlist. |
| `Playout: refresh playlist` | None | Refreshes the current Power Studio playout playlist. |
| `Playout: set next item` | Program line id | Sets a playlist line as next by its global line id. |
| `Playlist: set next visible item` | Item `1` to `16` | Sets the visible playlist window item as next. |
| `Playlist: previous window` | None | Moves the visible playlist window 16 items back. |
| `Playlist: next window` | None | Moves the visible playlist window 16 items forward. |
| `Playlist: reset window` | None | Resets the visible playlist window to the first item. |
| `Playlist: set window offset` | Offset `0` to `999` | Jumps the visible playlist window to a zero-based playlist offset. |
| `Carts: trigger rack slot` | Cart A or Cart B; rack slot `1` to `7` | Triggers a cart rack slot. |
| `Carts: stop cart player` | Cart A or Cart B | Stops the selected cart player. |
| `Mix editor: command` | Command | Sends a mix editor command. |
| `Recorder: command` | Command | Sends a recorder command. |

Player commands:

- `Play`
- `Stop`
- `Cue`
- `StopAndCue`
- `PflOn`
- `PflOff`
- `PflToggle`

Playout modes:

- `Automation`
- `LiveAssist`
- `TrainingMode`

Mix editor commands:

- `play`
- `stop`
- `record`
- `save`
- `undo`
- `previousmix`
- `nextmix`
- `previousprofile`
- `nextprofile`
- `selectprofile`

Recorder commands:

- `play`
- `stop`
- `record`
- `record_start`
- `record_stop`
- `previous_profile`
- `next_profile`
- `select_profile`

## Feedbacks

Feedbacks let buttons change style based on the latest status read from Power Studio.

| Feedback | Options | True when |
| --- | --- | --- |
| `Power Studio connection is OK` | None | Companion's connection status for this module is OK. |
| `Power Studio connection is not OK` | None | Companion's connection status for this module is anything other than OK. Presets use this to turn buttons dark gray during bad or missing connections. |
| `Any player is playing` | None | One or more playout players are playing. |
| `Any cart is playing` | None | One or more cart players are playing. |
| `Playout mode is active` | Mode | Power Studio is in the selected playout mode. |
| `On-air state is active` | `OffAir` or `OnAir` | Power Studio reports the selected on-air state. |
| `Player state is active` | Player A to Player D; state | The selected player has the selected state active. |
| `Player has item loaded` | Player A to Player D | The selected player has a title, artist, duration or track id. |
| `Player is empty` | Player A to Player D | The selected player is known and has no title, artist, duration or track id. |
| `Player transport preset text follows title setting` | Player A to Player D; transport | Updates preset text when the player transport title display option changes. Automatically included in player transport presets. |
| `Cart is playing` | Cart A or Cart B | The selected cart player is playing. |
| `Cart rack slot has status` | Cart A or Cart B; rack slot `1` to `7`; status | The selected rack slot has the selected status. Empty slots count as `None`. |
| `Cart rack preset text follows title setting` | Cart A or Cart B; rack slot `1` to `7` | Updates preset text when the cart rack title display option changes. Automatically included in cart rack presets. |
| `Playlist window item state is active` | Item `1` to `16`; state | The visible playlist item exists, is playing or is next. |
| `Playlist window item has content type` | Item `1` to `16`; content type | The visible playlist item has the selected content type. |
| `Playlist window preset text follows title setting` | Item `1` to `16` | Updates preset text when the playlist window title display option changes. Automatically included in playlist window item presets. |
| `Mix editor state is active` | State | The mix editor reports the selected state as active. |
| `Recorder state is active` | State | The recorder reports the selected state as active. |

Player states:

- `playing`
- `cued`
- `pfl`
- `isNextItem`

Cart rack statuses:

- `None`
- `Loaded`
- `Selected`
- `Playing`

Playlist item states:

- `hasItem`
- `isPlaying`
- `isNextItem`

Playlist content types:

- `Track`
- `Jingle`
- `Promo`
- `Spot`
- `VoiceTrack`
- `Misc`

Mix editor states:

- `playing`
- `recording`
- `canPlay`
- `canStop`
- `canSave`
- `canUndo`
- `canGoPreviousMix`
- `canGoNextMix`
- `canRecordMix`
- `canPlayNext`

Recorder states:

- `playing`
- `recording`
- `stopped`
- `canPlay`
- `canStop`
- `canStartRecord`
- `canChangeProcessingProfile`

## Companion Triggers

Companion triggers live in Companion's Triggers tab. A trigger has:

- An event, often `On variable change`.
- An optional condition, often one of this module's feedbacks.
- Actions, which can be Power Studio actions or actions from other Companion connections.

This module exposes trigger-friendly variables and feedbacks. Use variables when you want to react to a state change, and feedbacks when you want to filter whether the trigger should run.

Useful variables for triggers:

| Variable | Use |
| --- | --- |
| `connection_ok` | Detect connection loss or recovery. |
| `any_player_playing` | Detect that playout started or stopped. |
| `any_cart_playing` | Detect that any cart started or stopped. |
| `active_player` | Name of the first currently playing player. |
| `current_track_id` | Track id of the first currently playing player. |
| `current_track_artist` | Artist of the first currently playing player. |
| `current_track_title` | Title of the first currently playing player. |
| `next_player` | Name of the player that is marked as next. |
| `next_track_id` | Track id of the next player. |
| `next_track_artist` | Artist of the next player. |
| `next_track_title` | Title of the next player. |
| `active_cart` | Name of the first currently playing cart. |
| `cart_a_playing` / `cart_b_playing` | Detect a specific cart player. |
| `playlist_item_1_is_next_item` | Detect when a visible playlist item becomes next. Replace `1` with item `1` through `16`. |
| `mix_editor_recording` | Detect mix editor recording state. |
| `recorder_recording` | Detect recorder recording state. |
| `recorder_playing` | Detect recorder playback state. |

Useful feedbacks as trigger conditions:

| Feedback | Use |
| --- | --- |
| `Power Studio connection is OK` | Run only while the module is connected. |
| `Power Studio connection is not OK` | Run only while the module is disconnected or in a bad state. |
| `Any player is playing` | Run only while playout is active. |
| `Any cart is playing` | Run only while at least one cart is active. |
| `Player has item loaded` | Run only when the selected player has content loaded. |
| `Player is empty` | Run only when the selected player is empty. |
| `Playout mode is active` | Run only in Automation, Live Assist or Training Mode. |
| `Recorder state is active` | Run only when the selected recorder state is active. |

Example trigger recipes:

| Goal | Event | Condition | Action idea |
| --- | --- | --- | --- |
| Show a warning when Power Studio disconnects | `connection_ok` changes | `Power Studio connection is not OK` | Press an internal warning button or trigger a light. |
| Turn on an on-air tally when playout starts | `any_player_playing` changes | `Any player is playing` | Control a GPIO, HTTP device or lighting system. |
| Show that a cart is active | `any_cart_playing` changes | `Any cart is playing` | Trigger a cart-active tally or page change. |
| React when a playlist item becomes next | `playlist_item_1_is_next_item` changes | Value is true, or use playlist item feedback | Run an external command or update another Companion page. |
| Show mix recording state | `mix_editor_recording` changes | Value is true | Trigger a recording lamp or notification. |
| Show recorder recording state | `recorder_recording` changes | Value is true | Trigger a recorder lamp or notification. |

## Variables

You can place variables in button text. Use this Companion syntax:

```text
$(hopla-powerstudio:variable_name)
```

If you rename the Companion connection, use that connection label instead of `hopla-powerstudio`.

### Connection And API Variables

| Variable | Meaning |
| --- | --- |
| `connection_status` | Current Companion connection status text. |
| `connection_ok` | Whether the Companion connection status for this module is OK. |
| `last_status_error` | Latest error while polling Power Studio status. |
| `last_command_error` | Latest error while running a button command. |
| `version` | Current Power Studio version while the module connection is OK. Empty when the connection is not OK. |
| `build` | Current Power Studio build while the module connection is OK. Empty when the connection is not OK. |
| `last_detected_power_studio_version` | Last Power Studio version successfully read from the REST API. |
| `last_detected_power_studio_build` | Last Power Studio build successfully read from the REST API. |
| `parsed_power_studio_version` | Version parser output used by the module for compatibility checks. |
| `power_studio_minimum_supported_version` | Minimum Power Studio version supported by this module. |
| `power_studio_version_supported` | Whether the detected Power Studio version is supported. |
| `enabled_capabilities` | Capabilities currently enabled by version detection. |
| `uptime` | Power Studio application uptime. |
| `last_updated` | Last successful status update timestamp. |

### Playout Variables

| Variable | Meaning |
| --- | --- |
| `playout_mode` | Current playout mode. |
| `on_air_state` | Current on-air state. |
| `any_player_playing` | Whether one or more playout players are playing. |
| `active_player` | Name of the first currently playing player. |
| `current_track_id` | Track id of the first currently playing player. |
| `current_track_artist` | Artist of the first currently playing player. |
| `current_track_title` | Title of the first currently playing player. |
| `next_player` | Name of the player that is marked as next. |
| `next_track_id` | Track id of the next player. |
| `next_track_artist` | Artist of the next player. |
| `next_track_title` | Title of the next player. |
| `next_playlist_time_mode` | Current next playlist time mode. |
| `next_start_time` | Next start time reported by Power Studio. |

Player variables use the player letter. Replace `a` with `a`, `b`, `c` or `d`:

| Variable pattern | Meaning |
| --- | --- |
| `player_a_artist` | Artist loaded on Player A. |
| `player_a_title` | Title loaded on Player A. |
| `player_a_playing` | Whether Player A is playing. |
| `player_a_cued` | Whether Player A is cued. |
| `player_a_pfl` | Whether Player A has PFL active. |
| `player_a_position` | Current playback position for Player A, in seconds. |
| `player_a_duration` | Current item duration for Player A, in seconds. |

### Cart Variables

Cart-related variables include aggregate trigger helpers and per-cart variables. For per-cart variables, replace `a` with `a` or `b`:

| Variable pattern | Meaning |
| --- | --- |
| `any_cart_playing` | Whether one or more cart players are playing. |
| `active_cart` | Name of the first currently playing cart. |
| `cart_a_playing` | Whether Cart A is playing. |
| `cart_a_position` | Current playback position for Cart A, in seconds. |
| `cart_a_duration` | Current item duration for Cart A, in seconds. |
| `cart_a_play_mode` | Current play mode for Cart A. |

Cart rack variables exist for rack slots `1` through `7`. Replace `a` and `1` with the cart letter and rack slot:

| Variable pattern | Meaning |
| --- | --- |
| `cart_a_slot_1_title` | Title loaded in Cart A, rack slot `1`. |
| `cart_a_slot_1_status` | Status of Cart A, rack slot `1`. |

### Playlist Window Variables

| Variable | Meaning |
| --- | --- |
| `playlist_window_offset` | Zero-based offset of the current playlist window. |
| `playlist_window_first_item` | Human-friendly number of the first visible playlist item. |

Playlist item variables exist for visible items `1` through `16`. Replace `1` with the visible item number:

| Variable pattern | Meaning |
| --- | --- |
| `playlist_item_1_has_item` | Whether visible item `1` exists. |
| `playlist_item_1_line_id` | Global line id of visible item `1`. |
| `playlist_item_1_artist` | Artist of visible item `1`. |
| `playlist_item_1_title` | Title of visible item `1`. |
| `playlist_item_1_content_type` | Content type of visible item `1`. |
| `playlist_item_1_duration` | Duration of visible item `1`. |
| `playlist_item_1_start_time` | Start time of visible item `1`. |
| `playlist_item_1_is_playing` | Whether visible item `1` is currently playing. |
| `playlist_item_1_is_next_item` | Whether visible item `1` is the next item. |

### Mix Editor Variables

| Variable | Meaning |
| --- | --- |
| `mix_editor_playing` | Whether the mix editor is playing. |
| `mix_editor_recording` | Whether the mix editor is recording. |
| `mix_editor_can_play` | Whether play is currently available. |
| `mix_editor_can_stop` | Whether stop is currently available. |
| `mix_editor_can_save` | Whether save is currently available. |
| `mix_editor_can_undo` | Whether undo is currently available. |
| `mix_editor_can_go_previous_mix` | Whether previous mix is currently available. |
| `mix_editor_can_go_next_mix` | Whether next mix is currently available. |
| `mix_editor_can_record_mix` | Whether record is currently available. |
| `mix_editor_can_play_next` | Whether play next is currently available. |

### Recorder Variables

| Variable | Meaning |
| --- | --- |
| `recorder_file_name` | File name of the current recorder item, when available. |
| `recorder_playing` | Whether the recorder is playing. |
| `recorder_recording` | Whether the recorder is recording. |
| `recorder_stopped` | Whether the recorder is stopped. |
| `recorder_position` | Current recorder position, in seconds. |
| `recorder_duration` | Current recorder duration, in seconds. |
| `recorder_can_play` | Whether recorder play is currently available. |
| `recorder_can_stop` | Whether recorder stop is currently available. |
| `recorder_can_start_record` | Whether recorder recording can be started. |
| `recorder_can_change_processing_profile` | Whether recorder processing-profile changes are currently available. |

## Troubleshooting

If buttons stay dark gray, the module connection is not OK. Check the connection settings and put `connection_status` or `last_status_error` on a temporary button. A yellow/orange warning triangle usually points to authentication failure; a red warning triangle usually points to no connection.

If `last_status_error` says values could not be retrieved from the Power Studio REST API, check the host, port, path prefix, Basic Auth setting, credentials and whether the REST API Plugin is enabled in Power Studio.

If authorization fails with Basic Auth disabled, check whether a user is currently logged into Power Studio. If authorization fails with Basic Auth enabled, check the module username and password.

If the module is connected but commands cannot be operated, check whether a user is currently logged into Power Studio.

If the connection status says `Power Studio version 1.24.1 or newer is required`, the REST API is reachable but the Power Studio version is too old for this module.

If a command does not work, put `last_command_error` on a temporary button. This usually tells you whether Power Studio rejected the command, the item no longer exists, the API cannot be reached, or the current Power Studio state does not allow the command.

If a playlist button sets the wrong item as next, check the current playlist window. Use `PREV WINDOW`, `NEXT WINDOW` and `RESET WINDOW`, and show `playlist_window_first_item` on the page.

If a cart button has no title, the rack slot is probably empty. Empty rack slots intentionally show as `None`.
