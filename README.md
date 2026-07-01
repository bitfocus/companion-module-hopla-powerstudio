# HOPLA Power Studio Companion Module

Bitfocus Companion module for controlling Power Studio through its REST API.

## Features

- Connects to Power Studio over HTTP or HTTPS with optional Basic authentication.
- Polls application version/uptime, playout state, carts, mix editor state, recorder state and the current playlist.
- Controls 4 playout players and 2 cart players.
- Provides fixed cart rack presets for two cart players with seven rack slots each.
- Provides player transport presets with live artist/title variables.
- Provides playout mode presets for Automation, Live Assist and Training Mode.
- Provides mix editor presets with state-based feedback.
- Provides recorder presets with state-based feedback.
- Provides a 16-item playlist window for setting playlist items as the next playout item.
- Lets operators hide long title lines on cart rack, player transport and playlist window presets.
- Turns all preset buttons dark gray when the Companion connection to Power Studio is not OK.
- Provides trigger-friendly variables and feedbacks for Companion trigger conditions.
- Detects the Power Studio API version and builds a capability map for future API changes.
- Maps HTTP, network, timeout, authentication, permission and invalid JSON errors to suitable Companion statuses.

## Requirements

- A running Power Studio system with the REST API enabled.
- The Power Studio REST API Plugin configured and enabled.
- Network access from the Companion machine to the Power Studio REST API.
- Optional REST API credentials when the Power Studio REST API Plugin setting `Authenticate request using Basic Auth.` is enabled.
- Power Studio API `1.24.1` or newer.

Recommended setup for this module: leave `Authenticate request using Basic Auth.` disabled in the Power Studio REST API Plugin, and leave the module `Username` and `Password` fields empty. In that mode, the REST API uses the credentials of the user currently logged into Power Studio. If no user is logged into Power Studio, the REST API returns HTTP `401`.

When `Authenticate request using Basic Auth.` is enabled, the module can authenticate with the configured `Username` and `Password`, even when no user is logged into Power Studio. However, the module functions cannot be operated without an active logged-in Power Studio user: Playout, Carts, Mix Editor, Recorder and Playlist Window control require a user session in Power Studio.

When an older Power Studio version is detected, the module sets the Companion connection status to `Power Studio version 1.24.1 or newer is required` and disables functional polling/actions through the capability map.

## Configuration Reference

| Setting | Description |
| --- | --- |
| Protocol | `HTTP` or `HTTPS`. |
| Power Studio host | Host name or IP address of the Power Studio machine. |
| Port | REST API port. Must match the port configured in the Power Studio REST API Plugin. Default: `9876`. |
| Path prefix | Optional path prefix, for example `/powerstudio` when using a reverse proxy. |
| Username | Username for Basic authentication. Only fill this when `Authenticate request using Basic Auth.` is enabled in the Power Studio REST API Plugin. Recommended: leave empty. |
| Password | Password for Basic authentication. Stored as a Companion secret. Only fill this when Basic Auth is enabled in Power Studio. Recommended: leave empty. |
| Poll interval | Milliseconds between status polls. Default: `500`. Minimum: `100`. |
| Request timeout | Milliseconds before an HTTP request is aborted. Default: `3000`. |
| Show titles on cart rack presets | Shows the current cart slot title below `CART A:1` style labels. Default: enabled. |
| Show titles on player transport presets | Shows live artist/title lines below `PLAY A`, `CUE A` and `PFL A` style labels. Default: enabled. |
| Show titles on playlist window presets | Shows live artist/title lines below `NEXT 1` through `NEXT 16`. Default: enabled. |

Cart rack, player transport and playlist window presets include text feedbacks for these title display options. Buttons created with this module version update when the options change later. Buttons created with an older module version may need to be dragged from the preset list once more.

These text feedbacks use the current Companion connection label for variable references. For example, if the connection is named `Power_Studio`, the generated cart title line uses `$(Power_Studio:cart_a_slot_1_title)`.

## REST API Usage

The module polls these endpoints when supported by the detected API version:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/status/total` | Read Power Studio version, uptime, playout, carts, mix editor and recorder state in one request. |
| `GET /api/playlist/current` | Read the current playlist for the playlist window. |

Commands use these endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/playout/player` | Send a player command. |
| `POST /api/playout/mode` | Set playout mode. |
| `POST /api/playout/next` | Load the next playlist. |
| `POST /api/playout/refresh` | Refresh playout. |
| `POST /api/playout/nextitem` | Set a global playlist line id as next. |
| `POST /api/carts/trigger` | Trigger a cart rack slot. |
| `POST /api/carts/stop` | Stop a cart player. |
| `POST /api/mixeditor/{command}` | Run a mix editor command. |
| `POST /api/recorder/play` | Play the current recorder item. |
| `POST /api/recorder/stop` | Stop recorder playback or recording. |
| `POST /api/recorder/record` | Toggle recorder recording. |
| `POST /api/recorder/record/start` | Start recorder recording. |
| `POST /api/recorder/record/stop` | Stop recorder recording. |
| `POST /api/recorder/profile/previous` | Move to the previous recorder processing profile. |
| `POST /api/recorder/profile/next` | Move to the next recorder processing profile. |
| `POST /api/recorder/profile/select` | Select the currently previewed recorder processing profile. |

Commands are followed by an immediate status refresh so feedbacks and variables update quickly after a button press.

## Indexing Model

Power Studio API indexes are used directly:

| Item | Indexing |
| --- | --- |
| Playout players | `0` through `3` |
| Cart players | `0` and `1` |
| Cart rack slots | `0` through `6` |
| Playlist window items | `1` through `16` because they are Companion-visible items |

In the Companion UI, playout players are shown as Player A-D, carts as Cart A-B, and cart rack slots as `1` through `7`. These labels are converted to API indexes when commands are sent.

| Companion label | API index |
| --- | --- |
| Player A, B, C, D | `0`, `1`, `2`, `3` |
| Cart A, B | `0`, `1` |
| Rack slot `1` through `7` | `0` through `6` |

## Development

This module targets Node.js 22, matching the Companion module runtime.

Install dependencies:

```bash
yarn install
```

Build the module:

```bash
yarn build
```

Run TypeScript in watch mode while editing:

```bash
yarn dev
```

Run linting:

```bash
yarn lint
```

Build a Companion package:

```bash
yarn package
```

When making a code or behavior change, add a matching entry to the Version History section in `companion/HELP.md`.

## Companion Development Setup

Set Companion's developer modules path to the parent folder containing this module. Companion will load the built `dist/main.js` through `companion/manifest.json`.

During development, keep `yarn dev` running so every save rebuilds TypeScript into `dist`.

## Source Structure

- `src/main.ts`: Companion lifecycle, polling, command execution and dynamic refreshes.
- `src/client.ts`: HTTP REST client for Power Studio.
- `src/actions.ts`: Companion actions.
- `src/feedbacks.ts`: Companion feedbacks.
- `src/presets.ts`: Companion presets.
- `src/variables.ts`: Companion variables.
- `src/capabilities.ts` and `src/version.ts`: API version and capability handling.
- `src/errors.ts`: error classification and Companion status mapping.
- `src/cart-rack.ts`: dynamic cart rack helpers.
- `src/playlist-window.ts`: fixed-item playlist window helpers.

## API Compatibility

The module reads the Power Studio version from `/api/status/total` and builds a capability map from that reported version. Current functionality targets API `1.24.1`. Future API additions should be added in `src/capabilities.ts` with the minimum Power Studio version that supports them, then actions and polling can be gated by that capability.

## Error Handling

HTTP, timeout, network and invalid JSON errors are handled separately. Authentication and permission failures map to Companion's authentication/permission statuses, polling failures use a generic REST API values message without naming the internal status endpoint, and command-only conflicts such as HTTP `409` are reported as warnings instead of connection failures. In Companion's connection indicator, an authentication failure shows as a yellow/orange warning triangle, while a missing connection such as a network or timeout failure shows as a red warning triangle. Presets use dark gray as their base style and only show blue, green, yellow, orange, red or other status colors through feedbacks. This keeps operator pages neutral while the module is disabled, restarting, disconnected or in a bad connection state. The variables `last_status_error` and `last_command_error` expose the latest detailed messages.

| Error | Handling |
| --- | --- |
| HTTP `400` | Invalid request. Polling errors become errors; command errors become warnings. |
| HTTP `401` | Authentication failure. If Basic Auth is disabled in Power Studio, make sure a user is logged into Power Studio. If Basic Auth is enabled, check the module username and password. |
| HTTP `403` | Insufficient permissions. |
| HTTP `404` during polling | Bad configuration, usually host, port or path prefix. The user-facing message does not name the internal status endpoint. |
| HTTP `404` during command | Requested item may no longer exist. |
| HTTP `409` during command | Command cannot be performed in the current Power Studio state. |
| HTTP `5xx` | Power Studio server error. |
| Timeout | Connection failure. |
| Network error | Connection failure. |
| Invalid JSON | Unknown error; the API response could not be parsed. |

## Actions Reference

| Category | Action | Description |
| --- | --- | --- |
| Status | Refresh cached status | Polls Power Studio immediately and updates variables and feedbacks. |
| Playout | Playout: send player command | Sends `Play`, `Stop`, `Cue`, `StopAndCue`, `PflOn`, `PflOff` or `PflToggle` to a player. `Cue` uses the same smart cue-or-stop behavior as the Cue preset. |
| Playout | Playout: cue or stop player | Sends `Stop` when the selected player is playing, otherwise sends `Cue`. |
| Playout | Playout: set mode | Changes playout mode to `Automation`, `LiveAssist` or `TrainingMode`. |
| Playout | Playout: load next playlist | Loads the next playlist. |
| Playout | Playout: refresh playlist | Refreshes the Power Studio playout playlist. |
| Playout | Playout: set next item | Sets a program log line as next by global line id. |
| Playlist | Playlist: set next visible item | Sets the visible playlist window item as next. |
| Playlist | Playlist: previous window | Moves the visible playlist window 16 items back. |
| Playlist | Playlist: next window | Moves the visible playlist window 16 items forward. |
| Playlist | Playlist: reset window | Moves the playlist window back to the first item. |
| Playlist | Playlist: set window offset | Jumps to a zero-based playlist offset. |
| Carts | Carts: trigger rack slot | Triggers a cart rack slot. |
| Carts | Carts: stop cart player | Stops a cart player. |
| Mix Editor | Mix editor: command | Sends a command to `/api/mixeditor/{command}`. |
| Recorder | Recorder: command | Sends a command to the recorder endpoints. |

## Feedbacks Reference

| Category | Feedback | Description |
| --- | --- | --- |
| Connection | Power Studio connection is OK | True when the Companion connection status is `Ok`. |
| Connection | Power Studio connection is not OK | True when the Companion connection status is anything other than `Ok`. Presets use this feedback last so disconnected or bad connections force a dark gray button background. |
| Playout | Any player is playing | True when one or more playout players are playing. Useful as a Companion trigger condition. |
| Playout | Playout mode is active | True when the current playout mode matches the selected mode. |
| Playout | On-air state is active | True when Power Studio reports the selected on-air state. |
| Player | Player state is active | True when `playing`, `cued`, `pfl` or `isNextItem` is active for the selected player. |
| Player | Player has item loaded | True when the selected player has a title, artist, duration or track id. |
| Player | Player is empty | True when the selected player is known and has no title, artist, duration or track id. |
| Player | Player transport preset text follows title setting | Advanced feedback that updates preset text when the player transport title display option changes. Automatically included in player transport presets. |
| Carts | Any cart is playing | True when one or more cart players are playing. Useful as a Companion trigger condition. |
| Carts | Cart player is playing | True while the selected cart player is playing. |
| Carts | Cart rack slot has status | True when a rack slot has status `None`, `Loaded`, `Selected` or `Playing`. Empty slots are treated as `None`. |
| Carts | Cart rack preset text follows title setting | Advanced feedback that updates preset text when the cart rack title display option changes. Automatically included in cart rack presets. |
| Playlist | Playlist window item state is active | True when a visible item exists, is playing or is next. |
| Playlist | Playlist window item has content type | True when a visible item has the selected content type. |
| Playlist | Playlist window preset text follows title setting | Advanced feedback that updates preset text when the playlist window title display option changes. Automatically included in playlist window item presets. |
| Mix Editor | Mix editor state is active | True when the selected mix editor state is active. |
| Recorder | Recorder state is active | True when the selected recorder state is active. |

## Variables Reference

Use variables in button text with Companion syntax:

```text
$(hopla-powerstudio:variable_name)
```

If the Companion connection is renamed, replace `hopla-powerstudio` with that connection label.

Connection and Power Studio version variables:

- `connection_status`
- `connection_ok`
- `last_status_error`
- `last_command_error`
- `version`
- `build`
- `last_detected_power_studio_version`
- `last_detected_power_studio_build`
- `parsed_power_studio_version`
- `power_studio_minimum_supported_version`
- `power_studio_version_supported`
- `enabled_capabilities`
- `uptime`
- `last_updated`

`version` and `build` are only filled while the module connection is OK. When Power Studio is disconnected or reports an unsupported version, those variables are cleared. `last_detected_power_studio_version` and `last_detected_power_studio_build` keep the last successfully read values from `/api/status/total` for troubleshooting. `parsed_power_studio_version` shows the semver parser output used for compatibility checks.

Playout variables:

- `playout_mode`
- `on_air_state`
- `any_player_playing`
- `active_player`
- `current_track_id`
- `current_track_artist`
- `current_track_title`
- `next_player`
- `next_track_id`
- `next_track_artist`
- `next_track_title`
- `next_playlist_time_mode`
- `next_start_time`
- `player_a_artist`, `player_a_title`, `player_a_playing`, `player_a_cued`, `player_a_pfl`, `player_a_position`, `player_a_duration`

Player variable keys are `a` through `d`. Player `position` and `duration` values are reported in seconds.

Cart variables:

- `any_cart_playing`
- `active_cart`
- `cart_a_playing`
- `cart_a_position`
- `cart_a_duration`
- `cart_a_play_mode`
- `cart_a_slot_1_title`
- `cart_a_slot_1_status`

Cart variable keys are `a` and `b`. Cart `position` and `duration` values are reported in seconds. Rack slot variable numbers are `1` through `7`.

Playlist window variables:

- `playlist_window_offset`
- `playlist_window_first_item`
- `playlist_item_1_has_item`
- `playlist_item_1_line_id`
- `playlist_item_1_artist`
- `playlist_item_1_title`
- `playlist_item_1_content_type`
- `playlist_item_1_duration`
- `playlist_item_1_start_time`
- `playlist_item_1_is_playing`
- `playlist_item_1_is_next_item`

Playlist item numbers are `1` through `16`.

Mix editor variables:

- `mix_editor_playing`
- `mix_editor_recording`
- `mix_editor_can_play`
- `mix_editor_can_stop`
- `mix_editor_can_save`
- `mix_editor_can_undo`
- `mix_editor_can_go_previous_mix`
- `mix_editor_can_go_next_mix`
- `mix_editor_can_record_mix`
- `mix_editor_can_play_next`

Recorder variables:

- `recorder_file_name`
- `recorder_playing`
- `recorder_recording`
- `recorder_stopped`
- `recorder_position`
- `recorder_duration`
- `recorder_can_play`
- `recorder_can_stop`
- `recorder_can_start_record`
- `recorder_can_change_processing_profile`

Recorder `position` and `duration` values are reported in seconds.

## Dynamic Cart Rack Presets

The module builds cart rack trigger presets for two cart players. Each cart player always has seven rack slots, shown as `1` through `7` in Companion and mapped to API indexes `0` through `6`. Preset ids and names stay stable, for example `Trigger Cart A slot 3`, while the default button text uses variables such as `$(hopla-powerstudio:cart_a_slot_3_title)` to show the current rack title from `/api/carts`. The module configuration can hide that title line, leaving compact labels such as `CART A:3`. Empty rack slots are treated as status `None`. Rack status feedback colors are applied as follows: `None` gray, `Loaded` blue, `Selected` yellow and `Playing` green. If the connection is not OK, the connection feedback overrides these colors and keeps the button dark gray.

## Player Transport Presets

Player transport presets are generated for Player A-D. Each player gets Play, Cue and PFL presets; there is no separate Stop preset. The Cue preset behaves like Power Studio: it sends `Stop` while the player is playing and sends `Cue` when the player is stopped or idle. Default button text uses live artist/title variables. The module configuration can hide those title lines, leaving compact labels such as `PLAY A`, `CUE A` and `PFL A`.

Player transport colors are grouped by button:

| Button | Colors |
| --- | --- |
| Play | Dark gray when empty, blue when loaded, yellow when next, green while playing. In Automation mode, non-playing players are dark gray but the currently playing player stays green. |
| Cue | Dark gray when empty or already cued, orange when stopped but not cued, red while playing. |
| PFL | Dark gray when inactive, yellow when active. |

When Power Studio is in Automation mode, player transport cannot be operated. Cue and PFL are forced to dark gray, and Play is forced to dark gray for non-playing players. The Play preset still turns green for the player that is currently playing, so the active player remains visible. If the connection is not OK, all player transport presets are forced to dark gray.

## Mix Editor Presets

Mix editor presets cover play, stop, record, save, undo, previous/next mix and previous/next profile navigation. Buttons are gray by default, turn blue when the related `can...` state is true, turn green while the mix editor is playing, and turn red while playback or recording can be stopped. Profile navigation buttons turn blue when connected because API `1.24.1` does not expose separate availability states for profile navigation. If the connection is not OK, all mix editor presets stay dark gray.

## Recorder Presets

Recorder presets cover play, stop, recording control and recorder processing-profile navigation. Buttons are gray by default, turn blue when the related recorder command is available, turn green while the recorder is playing, and turn red while playback or recording can be stopped. Recorder profile buttons use `canChangeProcessingProfile`, so they only turn blue when Power Studio reports that processing-profile changes are available. If the connection is not OK, all recorder presets stay dark gray.

Recorder preset ids:

- `recorder_play`
- `recorder_stop`
- `recorder_record`
- `recorder_record_start`
- `recorder_record_stop`
- `recorder_previous_profile`
- `recorder_next_profile`
- `recorder_select_profile`

## Playlist Window Presets

The module polls `/api/playlist/current` and exposes a 16-item playlist window. Each item button sets the currently visible playlist line as the next playout item by posting its global line id to `/api/playout/nextitem`. The window can be moved with previous, next and reset presets. Default item text is driven by variables such as `playlist_item_1_artist` and `playlist_item_1_title`, so the Stream Deck page stays fixed while the visible playlist contents change. The module configuration can hide those title lines, leaving compact labels such as `NEXT 1`.

Playlist item colors are based on content type first: Track blue, Jingle purple, Promo cyan, Spot orange, VoiceTrack magenta and Misc slate gray. Next item then overrides that with yellow, currently playing overrides it with green, and a bad connection overrides everything with dark gray.

## Companion Trigger Support

Companion triggers are built in Companion from events, conditions and actions. This module does not register custom trigger events, but it exposes variables and feedbacks that are designed to be useful in the Triggers tab.

Use variable-change events for state transitions such as `connection_ok`, `any_player_playing`, `any_cart_playing`, `cart_a_playing`, `playlist_item_1_is_next_item`, `mix_editor_recording` or `recorder_recording`. Use the module feedbacks as trigger conditions when you want to filter those events, for example `Power Studio connection is not OK`, `Any player is playing`, `Any cart is playing`, `Player has item loaded`, `Player is empty`, `Playout mode is active` or `Recorder state is active`.

Typical trigger examples:

- When `connection_ok` changes to `false`, run an alert action or press an internal warning button.
- When `any_player_playing` changes to `true`, switch studio signaling or start logging.
- When `any_cart_playing` changes to `true`, show an external cart-active tally.
- When `playlist_item_1_is_next_item` changes to `true`, update a page, light or external system.
- When `mix_editor_recording` changes to `true`, run a recording indicator action.
- When `recorder_recording` changes to `true`, run a recorder-on indicator action.
