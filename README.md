# Sexy Home Assistant Tesla Card

<img src="https://raw.githubusercontent.com/borgqueenx/sexy-home-assistant-tesla-card/main/docs/spaceship-header.png" alt="A badly drawn car that came out as a spaceship" width="900">

**A personal fork of [MrNickIE/tesla-fleet-homeassistant](https://github.com/MrNickIE/tesla-fleet-homeassistant), customized as a Tesla-app-style Home Assistant dashboard card.** One card shows your
whole fleet - battery, range, charging, climate, locks, location - looking and
behaving like the official Tesla app, and switching between cars in one click.

Works with **all** Tesla integrations, automatically:
[tesla_custom](https://github.com/alandtse/tesla) (HACS), the official
**tesla_fleet** integration, **and** [Teslemetry](https://teslemetry.com/).

> ⚡ The upstream card and this fork were built conversationally with AI, using screenshots and screen recordings of the Tesla app as references.
> The original author is credited below; this fork adds the layout, card behavior, and image assets used in this Home Assistant setup.

| Home | Charging | Controls | Climate |
| --- | --- | --- | --- |
| ![Home view](docs/screenshots/1-home.png) | ![Charging](docs/screenshots/2-home-charging.png) | ![Controls view](docs/screenshots/3-controls.png) | ![Climate view](docs/screenshots/4-climate.png) |

---

## Install with HACS

This is a custom HACS Dashboard repository. HACS must already be installed in Home Assistant.

1. Open HACS and select the three-dot menu.
2. Choose Custom repositories.
3. Add https://github.com/borgqueenx/sexy-home-assistant-tesla-card and select Dashboard as the category.
4. Add the repository, open Sexy Home Assistant Tesla Card in HACS, and download it.
5. Refresh the Home Assistant dashboard in your browser or Companion app.

HACS installs the card and its bundled image packs together. The files are stored under
/config/www/community/sexy-home-assistant-tesla-card/ and served at
/hacsfiles/sexy-home-assistant-tesla-card/. The card resource is normally registered
automatically. If you use YAML-managed Lovelace resources, add this resource manually:

~~~yaml
url: /hacsfiles/sexy-home-assistant-tesla-card/sexy-home-assistant-tesla-card.js
type: module
~~~

The bundled images are under /hacsfiles/sexy-home-assistant-tesla-card/images/.
For a Model Y in white, the pack folder is images/models/y/white/app/. The images
option should point to that specific app/ folder, containing files such as
side.jpg and climate.jpg. If images is omitted, the card searches for the matching
bundled pack automatically.

### Manual installation

Copy the contents of this repository's dist/ folder into a folder such as
/config/www/sexy-home-assistant-tesla-card/. Add the resource
/local/sexy-home-assistant-tesla-card/sexy-home-assistant-tesla-card.js with type
module. The images can then be referenced under
/local/sexy-home-assistant-tesla-card/images/. To use a local pack, set the car images option to /local/sexy-home-assistant-tesla-card/images/models/y/white/app/ (use the matching model/paint folder). After replacing the JavaScript
file, refresh the browser; if it is cached, add or change a ?v= query value on
the resource URL.

## Quick start

1. Edit your dashboard → **Add card** → search **Tesla Fleet Card**.
2. Fill in the four fields:
   - **Name** - whatever you call the car.
   - **Model** - Model 3 or Model Y (picks the built-in artwork).
   - **Paint** - red, grey, … (picks the image pack and artwork colour).
   - **Entity prefix** - how your car's entities are named. Look at your
     battery entity: `sensor.battery` → leave empty; `sensor.saoirse_battery`
     → enter `saoirse_`. Works for both integrations; the card detects which
     one you're on.
3. Save. Add more cars with **+ Add car** - a dropdown on the car's name
   switches between them.

The same config in YAML:

```yaml
type: custom:tesla-fleet-card
cars:
  - name: Patsy
    model: Model Y
    paint: red
    prefix: ""
    car_offset_x: -20  # shift the car and its effects 20px left
    name_stats_gap: 8  # add 8px between the name and status/battery
    lux_entity: sensor.luna_lupa_lux  # Home Assistant illuminance entity
    lights_lux_below: 50  # show headlight effects under 50 lux while driving
    lights:  # positions in side-photo overlay coordinates (233 × 108)
      - [84, 74]
      - [14, 61]
    light_angle: 28  # degrees down from forward
    light_beam_length: 82
    light_beam_width: 16  # half-width
    light_source_size: 7
    light_source_thickness: 3.5
```

## Example: Luna Lupa

This example uses the white Model Y image pack shipped with the HACS installation.
The images value points to the pack's app/ directory; use /local/my-tesla-images/
instead if you keep your own image set there. You can also remove images entirely
and let the card find the matching bundled pack.

~~~yaml
type: custom:tesla-fleet-card
cars:
  - name: Luna Lupa
    model: Model Y
    paint: white
    prefix: luna_lupa
    steering: left
    images: /hacsfiles/sexy-home-assistant-tesla-card/images/models/y/white/app/
    force_drive_anim: false
    force_frunk_open: false
    force_trunk_open: false
    force_plugged: false
    lux_entity: sensor.weather_station_solar_lux
    lights_lux_below: 100
    cable_thickness: 0.4
    climate_hide_model: true
    climate_controls_position: bottom
    climate_back_x: 115
    climate_back_y: 78
    climate_back_size: 42
    climate_car_left: 68
    climate_car_top: -29
    climate_car_height: 130
    climate_controls_gap: 0
    climate_temp_gap: 0
    climate_temps_y: 0
    climate_controls_y: 0
    climate_modes_y: -70
    climate_cop_y: -30
    cable_points:
      - [43, 109]
      - [45, 108]
      - [81, 100]
      - [114, 96]
      - [120, 92]
      - [131, 60]
      - [139, 54]
      - [142, 57]
    light_angle: 36
    light_beam_length: 82
    light_beam_width: 26
    light_source_size: 77
    light_source_thickness: 1.5
    daylight_points:
      - [[57, 76.3], [63.5, 76.5], [71, 76]]
      - [[13.5, 61], [15, 65]]
    daylight_thickness: 1.1
    daylight_intensity: 0.9
    light_spot_width: 2.9
    light_spot_height: 2.5
    light_spot_intensity: 1.82
    light_star_size: 1.5
    light_star_intensity: 0.3
    lights:
      - [81, 74.9]
      - [14, 58]
    rest_car_margin: -75px -20px 0px auto
    rest_car_width: 405px
    car_offset_x: -25
    name_stats_gap: 8
    climate_icon_width: 32
    climate_icon_height: 24
    climate_squish_fix: 1.2
    climate_icon_scale: 1
    climate_anchors:
      wheel: [124, 209]
      fl: [127, 260]
      fr: [235, 260]
      rl: [123, 335]
      rc: [176, 335]
      rr: [229, 335]
    rest_anchors:
      frunk: [42, 19, 42, 9]
      trunk: [193, 60, 193, 8]
      lock: [60, 52, 60, 92]
      charger: [145, 55, 170, 110]
    rest_anchors_unplugged:
      frunk: [54, 59, 20, 40]
      trunk: [209, 10, 215, -7]
      lock: [144, 62, 185, 93]
      charger: [215, 20, 230, 40]
    wheels:
      lift: 1
      front: [107.2, 86, 17, 12, 127]
      rear: [206.5, 55, 0.85, 12, 19]
    road:
      angle: -19
      cycle: 0.55
      lines:
        - [101, 2.5]
        - [45, 1.8]
      clip: >-
        <rect x="-25" y="0" width="37" height="108"/><rect x="210" y="0"
        width="40" height="108"/>
~~~

### Reading and tuning this example

| YAML fields | What they control |
| --- | --- |
| name, model, paint | Card label and image selection. This config selects the white Model Y pack. |
| prefix, steering | Entity-name prefix and steering-wheel side. The card auto-detects supported Tesla integrations and normalizes a trailing underscore in a prefix. |
| images | Base URL of this car's pack folder, which must contain its image files. HACS installs its pack under the repository's HACS image path. The original personal path /local/my-tesla-images/ is also valid when that folder contains the pack images. |
| force_drive_anim, force_frunk_open, force_trunk_open, force_plugged | Visual preview switches. Keep them false for live vehicle state; they help arrange artwork and do not operate the car. |
| lux_entity, lights_lux_below | Illuminance sensor and threshold for the driving headlight effect. |
| lights, light_angle, light_beam_length, light_beam_width, light_source_size, light_source_thickness | Headlight positions and beam/glow dimensions, measured in the side-image overlay's 233 × 108 coordinate space. Beam width is a half-width. |
| daylight_points, daylight_thickness, daylight_intensity | Optional headlamp LED paths, their stroke width, and brightness. Each list in daylight_points is a separate line traced through the supplied coordinate points. |
| light_spot_*, light_star_* | Headlight spot and star-glint size and intensity. Large values are clamped to keep the effect within the image. |
| cable_points, cable_thickness | Charging-cable curve points and animated current-line thickness. Points use the side-image overlay coordinates; cable_thickness is a visual tuning value. |
| climate_hide_model, climate_controls_position | Show the AC label in the climate header and place the Power/temperature/Vent row at the card bottom. Bottom moves only that controls row; Defrost, Camp, and Pet remain in their own block. |
| climate_back_x, climate_back_y, climate_back_size | Back-button x/y position from the climate card's top-left and its diameter, in pixels. |
| climate_car_left, climate_car_top, climate_car_height | Climate photo placement and scale. These are percentages of the card/image layout; tune them for your card width and image framing. |
| climate_controls_gap, climate_temp_gap | Horizontal gap between climate controls and gap around the target temperature and its arrows, in pixels. |
| climate_temps_y, climate_controls_y, climate_modes_y, climate_cop_y | Vertical offsets in pixels for the temperature block, Power/temperature/Vent controls, Defrost/Camp/Pet block, and Cabin Overheat Protection block. Positive moves down; negative moves up. |
| climate_anchors | Tap positions for steering wheel and seat climate controls in the climate image. Use calibrate: true to measure custom images. |
| rest_car_margin, rest_car_width, car_offset_x | Main-view car placement. The margin and width accept CSS values; car_offset_x shifts the car and overlays horizontally in pixels. |
| name_stats_gap | Space between the car name and status/battery lines, in pixels. |
| climate_icon_width, climate_icon_height, climate_icon_scale, climate_squish_fix | Climate-control icon sizing and shape correction for the selected screen/device. |
| rest_anchors, rest_anchors_unplugged | Frunk, trunk, lock, and charger anchor positions in the side-image overlay. Each four-number entry is [image_x, image_y, label_x, label_y]; the second map is used while unplugged. |
| wheels, road | Wheel rotation geometry and road-strip angle, cycle, line coordinates, and optional SVG clipping. Leave these alone unless calibrating a different image pack. |

For coordinate-based options, start from the supplied values and change one group at
a time. Climate offsets are independent vertical nudges in pixels. The climate
controls position setting changes the control row's layout, while the offset
only adjusts its vertical placement.

## What you get

- **Home view** - your car resting, like the app's opening screen. Plugging in
  swaps to the cable shot; charging animates a green pulse along the cable
  (timing measured from the real app, frame by frame). Tap the car for
  Controls.
- **Controls view** - top-down car with tappable frunk/boot **Open** labels
  (two-tap confirm), lock/unlock on the roof, tyre pressures at the corners
  (psi or bar, whatever your integration reports), and a breathing charge bolt
  while charging.
- **Climate view** - the interior. Tap any seat to cycle its heater (uses
  whichever heat levels your car offers - ventilated-seat cars included),
  tap the steering wheel for its heater, set the temperature, Vent,
  **Defrost Car** - plus Bioweapon Defence, Camp and Pet modes and Cabin
  Overheat Protection where your car supports them.
- **Charging panel** - charge-limit slider with a click-stop at 80 %, live
  `kW · +kWh · A/maxA · V` stats, "1h 5m remaining to charge limit" in the
  header, amps stepper, Stop Charging / Unlock Charge Port as applicable.
- **Action row** - Flash, Honk, Port, Start, Vent (destructive ones need a
  second tap).
- **Image packs included** - this fork ships supported Model Y and Model 3 packs, including the white Model Y artwork used in the example. The card falls back to drawn artwork for model/paint combinations without a pack.

## Images

The card looks for images in this order - first hit wins. Generation is part
of the match; see [Body generations](#body-generations) below.

1. **Per-car options in YAML** - `image`, `image_side`, `image_charging`,
   `image_climate` and friends, each a `/local/...` path or full URL.
2. **A per-car pack folder** - `images: /local/my-pack` (or any URL base,
   e.g. a CDN or GitHub raw path).
3. **The shared pack folder** - `/config/www/tesla-fleet-card/images/` using
   the layout `models/<3|y>/<paint>/app/`. Drop packs here once; the card
   finds them from each car's Model + Paint with zero config, and HACS
   updates never touch this folder.
4. **The image packs installed by HACS** - the card checks the HACS-served image folder for a matching models/generation/paint/app pack. HACS installs dist/ contents together, so the images update with the card.
5. **The fork's GitHub image packs** - a raw GitHub fallback for supported Model + Paint combinations when the HACS image path is not available.
6. Nothing found → built-in drawn artwork.

Pack photos are treated as complete: the card draws no cable overlay on
them - a charging photo's own cable shows the state.

The standard pack uses these JPEG names and sizes. This repository also includes PNG equivalents where available, alternate climate frames, and open frunk/trunk combinations for the white Model Y. Keep the whole app/ folder together so those states can load.

| File | Size (px) | What it shows |
| --- | --- | --- |
| `topdown.jpg` | 720 × 1284 | Top-down car, nose at top, ~2 % margin, background `#141414`. |
| `topdown-plugged.jpg` | 720 × 1284 | Same, charge cable attached. |
| `topdown-charging.jpg` | 720 × 1284 | Same, charging. |
| `side.jpg` | 660 × 400 | Resting ¾ view, centred. |
| `side-plugged.jpg` | 660 × 400 | Same framing, cable attached. |
| `side-charging.jpg` | 660 × 400 | Same framing, charging, cable in shot. |

Those side sizes are for a **new** pack. Two of the four bundled packs are
660 × 330 instead, which is fine: the measurements are per pack, so what matters
is that a pack's own three side photos agree with each other, not which canvas
it uses.
| `climate.jpg` | 720 × 1200 | Interior top-down: dash ~10 % down, front seats ~27 %, rear bench ~48 %. |

Make your own from your own Tesla app: screenshot the app's home screen
(parked, plugged, charging), Controls and Climate pages full-screen on the
biggest display you have, crop to the car, patch out the baked-in UI labels
(the card draws live ones), save to the sizes above on `#141414`.

**The three side photos must show the car at the same size in the same place.**
Everything the card draws over them - the cable's travelling dashes, the
spinning wheels, the road marking - is measured once against the photographs, so
a frame that disagrees with its siblings makes the car appear to change size the
moment it starts charging and puts the overlays beside the thing they are meant
to sit on. Crop the three together, and check by measurement rather than by eye:
[docs/pack-images.md](docs/pack-images.md) has the rule, the check, and how to
rescue photos that already disagree.

### Body generations

Tesla has refreshed both cars, and a refresh changes the bodywork enough that
the photos do not transfer. So a pack has a generation as well as a model and
a paint:

| Pack | Car | Generation |
| --- | --- | --- |
| `models/y/red/app` | Model Y | pre-refresh |
| `models/y/white/app` | Model Y | Juniper, the 2025 refresh |
| `models/y-juniper/blue/app` | Model Y | Juniper, the 2025 refresh |
| `models/3/grey/app` | Model 3 | Highland, the 2024 refresh |

The card works out which generation your car is from the model year, which it
reads from the tenth character of the VIN. Model Y is unambiguous, because
Tesla brands the 2025-built Juniper as a 2026 model: `T` or later is Juniper,
`S` or earlier is pre-refresh. Model 3 is not, because Highland reached North
America in January 2024, so 2024 and later is Highland, 2022 and earlier is
not, and a 2023 could be either. The card does not guess at a 2023; set
`generation: highland` or `generation: classic` on the car if you want to be
sure.

A pack at a generation-qualified path wins if one exists, so
`models/y-juniper/red/app` in this repository or in your own
`/config/www/tesla-fleet-card/images/` is all it takes to serve a Juniper red
Model Y properly. **Contributions of the missing combinations are very
welcome** - see below.

**If the only pack in your paint is the other generation's, the card will not
use it.** It knows which generation each pack in this repository is, so serving
a pre-refresh Model 3 the Highland photos would just be showing you a
photograph of a different car. You get the no-pack panel instead, naming the
folder somebody needs to fill. Earlier versions did borrow the other
generation's bodywork, on the grounds that the colour was at least right; that
turned out to be a good way to make wrong artwork look official and to remove
any reason to fix it.

If you would rather have a picture of nearly your car than no picture, set
`allow_other_generation: true` on the car and the old behaviour comes back.
The card is not quiet about it either way: hover the car photo and it tells you
which generation you are looking at.

A pack of your own under `/config/www/tesla-fleet-card/images/` is never
refused, whatever folder you put it in. The card has no idea which generation
your photos are of, so it does not presume to judge them.

> **If you copied this repository's packs into your own `www` folder, name the
> folder for the generation.** `/local` is checked first, so a copy sitting at
> `models/3/grey/app` wins before the card ever reaches the one it would have
> refused, and you get the wrong bodywork with no warning. Rename it to
> `models/3-highland/grey/app` (or whichever it actually is) and it behaves.


**Controls not lining up on your images?** Set `calibrate: true` on the car,
tap the image where each control sits, read the coordinates off the badge, and
put them in `climate_anchors:` / `top_anchors:` (then remove `calibrate`).
Images made to the spec table need none of this.

## All YAML options

Per car:

| Option | What it does |
| --- | --- |
| `name`, `model`, `paint` | As in the editor. `paint` picks the image-pack folder, and colours the car's dot in the switcher. |
| `prefix` | Entity prefix. |
| `integration` | `auto` (default) / `tesla_custom` / `tesla_fleet` / `teslemetry`. |
| `entities:` | Per-entity overrides, e.g. `energy_added: sensor.modely_energy_added`. |
| `images` | Pack base folder or URL for this car. |
| `steering` | `left` (default) or `right`. Switches the steering wheel icon and heater tap anchor to the correct side. |
| `image`, `image_top_plugged`, `image_top_charging` | Top-down photos. |
| `image_side`, `image_side_plugged`, `image_charging` | Resting-view photos. |
| `force_frunk_open`, `force_trunk_open` | Visual-only preview of the open-panel image; set both to `true` to preview both. These previews cannot send cover commands. |
| `force_plugged` | Visual-only plugged-in preview using your plugged photo/cable. Charging animation still follows the real charging sensor; charge controls are disabled while preview is on. |
| `image_climate` | Interior photo override. If omitted, the card uses `climate3.jpg` from the configured image folder when present, then falls back to `climate.jpg`. `climate3.jpg` is the optional portrait image used by the climate drive-in animation and menu. |
| `climate_car_left`, `climate_car_top`, `climate_car_height` | Climate-mode car position and size. `left` is the horizontal center in percent (default `70`); `top` is percent from the top (default `1`); `height` is percent of the climate image box (default `120`). Example: `climate_car_left: 62`, `climate_car_top: -24`, `climate_car_height: 150`. The plugged-in cable follows this image position and extends to the card bottom. |
| `climate_back_size`, `climate_back_x`, `climate_back_y` | Climate-mode back-button size in pixels (default `28`) and optional x/y position from the climate card's left/top edges. Coordinates accept pixels or percentages; numeric values are pixels. If either coordinate is omitted, that axis keeps its automatic placement. Legacy `climate_back_left` / `climate_back_top` are also accepted. |
| `climate_hide_model` | Set to `true` to show `| AC` in the climate menu instead of the configured model name. The label fades with the climate menu. |
| `climate_controls_gap` | Horizontal spacing in pixels between Power, the temperature group, and Vent. Default `6`; negative values bring the icons closer or let them overlap slightly (accepted range `-64` to `64`). |
| `climate_temp_gap` | Spacing in pixels between the temperature number and its adjustment arrows. Default `4`; negative values pull the arrows closer (accepted range `-32` to `32`). |
| `climate_controls_position` | Set to `bottom` to center the Power/temperature/Vent row along the card bottom. Defrost, Camp, and Pet keep their existing left-side positions. Defaults to `left`, which keeps the current layout. |
| Climate menu temperatures and controls | Interior/exterior temperatures plus Defrost, Camp, and Pet buttons use the free space left of the image. Power, target temperature, and Vent stay together on one row; `climate_controls_position: bottom` moves only that row to the card bottom. |
| Climate menu transition | Entering climate animates the side-view car away, then brings the portrait climate image up from the bottom. The card keeps the normal main-view height, and the photo is clipped by the card viewport. |
| `climate_transition` | Optional per-car transition timings in seconds. `to_climate` and `to_main` each accept `drive_away` and `drive_in`; defaults are `0.5625` and `0.72`. Example: `climate_transition: { to_climate: { drive_away: 0.6, drive_in: 0.8 }, to_main: { drive_away: 0.7, drive_in: 0.7 } }`. Values are clamped to 0.08–5 seconds. |
| `car_offset_x` | Horizontal car-area offset in pixels, including overlays and animations. Negative moves left; positive moves right. |
| `name_stats_gap` | Extra spacing in pixels between the name and status/battery lines when they remain below the name. Positive moves the lines down; negative moves them up. Default `0` keeps the current layout. |
| `lights`, `light_leds` | Headlight positions and LED strips in the side-photo overlay coordinates (`233 × 108`). A light entry can be `[x, y]`; optional trailing values override angle, beam length, beam half-width, source width and source thickness. |
| `light_angle`, `light_beam_length`, `light_beam_width` | Per-car headlight defaults. Angle is degrees down from forward (the car faces left); length and width are overlay units. Defaults: `28`, `82`, `16`. |
| `light_source_size`, `light_source_thickness` | Headlamp glow width and thickness in overlay units. Defaults: `7` and `3.5`. |
| `wheels` | Optional measured wheel geometry for custom photos. A white Model Y uses the matching built-in geometry automatically, even with a custom `images` path. |
| `lux_entity`, `lights_lux_below` | Optional Home Assistant illuminance entity and threshold in lux. When configured, light effects show only while driving (or `force_drive_anim: true`) and the sensor value is below the threshold. Default threshold: `50`. |
| `cable: baked` | Photos already contain the cable (automatic when a pack is in use). |
| `cable_path`, `port_xy`, `port_top_xy` | Charging-animation anchors. |
| `climate_anchors:`, `top_anchors:`, `calibrate` | Tap-target positions for your own images. |
| `hide_seats` | Seats your car physically lacks, e.g. `hide_seats: [rl, rr]`. Keys: `fl fr rl rr`. Unavailable seat entities hide automatically. |
| `hide_climate` | Climate features your car lacks, e.g. `hide_climate: [bio]`. Keys: `bio camp pet`. |
| `show_climate` | Climate features your car has that the card assumed it did not, e.g. `show_climate: [bio]` for a Model 3 with a retrofitted HEPA filter. |
| `show_sentry` | Adds a Sentry button to the action row, also a tick box in the editor. It pulses red while sentry is on, asks for a second tap before turning it off, and is greyed out while the car is driving, because Tesla does not allow sentry on the move. Off by default. |
| `generation` | Which body generation this car is, when the model year cannot say: `classic`, `highland` or `juniper`. Only needed for a 2023 Model 3, which could be either, and the visual editor asks you for exactly that car rather than making you come here. |
| `allow_other_generation` | Use a pack from the other body generation when nothing matches yours. Off by default, because the result is a photograph of a different car. |

Card level: `default_car`, `show_tpms`, `tpms_min` (psi; auto-converted for
bar), `accent`, `drive_speed`, `show_vin`, `map_zoom`, `location_tap`.

| Card option | What it does |
| --- | --- |
| `map_zoom` | Zoom level for the in-card map view. 15 is about street level; higher is closer. |
| `location_tap` | `map` (default) opens the in-card map view; `more-info` opens the entity dialog instead. Can also be set per car. |
| `drive_speed` | Scales the driving animation. 1 is the default; 1.5 makes the road and wheels half again as fast. The animation is proportional to the car's actual speed, so this only changes the overall pace. |
| `show_vin` | Prints the VIN in the footer beside the year and model. Off by default: it identifies a specific vehicle and dashboards get screenshotted, so it sits in the footer's tooltip instead unless you ask for it. |

The footer shows the model year, which is decoded from the tenth character of
the VIN. The card reads the VIN from the car's own entity attributes, so there
is nothing to configure.

### Bioweapon Defense Mode

Tesla Custom reports the same `fan_modes` list for every car, so it cannot be
used to tell a car that has Bioweapon Defense Mode from one that does not. The
card falls back to the model instead: the mode needs a HEPA filter, which Model
S, X and Y carry and Model 3 does not, so the button is hidden on a Model 3.

The year matters too, and the card can see it. Model Y was built without the
filter until Tesla added it to the production line in June 2021, and Model S
and X only got it from 2016, so the card reads the model year from the VIN and
hides the button on a car too old to have had one. The VIN comes from the car's
own entity attributes; there is nothing to configure.

Both are retrofittable and the card cannot know that, so a car with a
retrofitted filter wants `show_climate: [bio]`. `hide_climate: [bio]` still
removes the button from any car.

## The driving view

Put the car in gear and the resting photo gets a road: a lane marking sliding
underneath, the wheels turning, and the car's speed where the "Parked 2h" timer
usually sits.

It is all measured off a screen recording of the Tesla app rather than
invented. The markings run parallel to the car's own wheelbase, which is why
each image pack carries the angle its photo was shot at. The wheels turn by
rotating the photograph's own pixels, clipped to each hub and un-squashed to a
circle first, so the spokes that move are the real ones. The rear wheel borrows
the front's pixels, because it is the same wheel and is drawn too small to
resample well on its own.

The animation is proportional to the car's actual speed: double the speed and
the road and wheels both double. `drive_speed` scales the overall pace if it
feels wrong on your screen. At a standstill in gear the road and wheels stay
drawn and stop moving, and the wheels render sharp, because the motion blur
only exists to smear motion. `drive_motion: off` on a car turns the whole thing
off.

Wheel geometry was measured for the bundled packs only. A pack we have not
measured gets a road but still wheels, because a wrong ellipse wobbles and that
looks worse than not moving. `wheels:` and `road:` let you supply your own.

**Speed comes from the `device_tracker` entity's `speed` attribute**, in
whatever units the car itself displays, so the card does no conversion and
labels it from the range sensor. Tesla Custom reports it as `null` rather than
`0` on a parked car.

**The speed is only as fresh as your polling.** Tesla Custom polls every
`scan_interval` seconds while a car is in Drive or Reverse, so at the default of
60 the number on the card can be a minute old. Lowering `scan_interval`
globally is a bad trade, because a parked car with sentry mode on then gets
polled just as hard and that costs range. Better is an automation that calls
`tesla_custom.polling_interval` with the driving car's VIN and a shorter
interval, and restores it when the car parks.

## The map view

Tapping **Location** opens a map of that car inside the card, zoomed to it, with
a **Back** button bottom left. `map_zoom` sets the zoom, 15 by default.

It is Home Assistant's own map card, built by the card with a single entity, so
it looks and behaves like every other map on your dashboard and follows the car
as it moves. It is done that way because there is nothing to link to: the Map
dashboard is a *strategy* dashboard, generated at runtime from every entity that
has coordinates, so no URL centres it on one car and none carries a zoom.

Nesting a built-in card means using `loadCardHelpers()`, which is how custom
cards have always done it but is not a documented API. Every failure path ends
in a sentence explaining itself and the entity dialog, which is what this row
opened before. A car with no coordinates says so rather than showing an empty
box: a sleeping car keeps its last known position, and one that has never
reported a position has nothing to show.

Prefer the old dialog? `location_tap: more-info`, on the card or on one car.

## Updating

HACS can install this repository directly from its default branch; a GitHub release is not required. Updates include the card and matching dist/images/ files. After updating, refresh the dashboard in your browser or Companion app. The running version prints in the browser console when the card loads.

## Requirements

Home Assistant with the [tesla_custom](https://github.com/alandtse/tesla)
HACS integration, the official tesla_fleet integration, or the Teslemetry integration - and a Tesla. 🚗

## Credits

Designed by mimicking the official Tesla app. Built end-to-end by
[Claude](https://claude.ai) in conversation with MrNickIE, who supplied
the screenshots, the screen recordings, the opinions, and the phrase
"you have drawn a SPACESHIP". Shared under the MIT licence - enjoy.

**Image packs.** The pre-refresh Model Y and the Highland Model 3 come from
MrNickIE's own cars. The Juniper Model Y in white came from
[@panka403](https://github.com/panka403) in PR #2. The Juniper Model Y in blue
was contributed by one of MrNickIE's neighbours, from photographs of their own
car and shared with their permission.

## Seat, wheel and climate display

Tesla stores a **mode and a level**, not a single number: Auto, or Heat or
Cool at Low, Medium or High. Setting a level by hand moves the car out of
Auto, which is what the app's Heat / Auto control is doing.

The card follows that:

- **Off** - grey waves
- **Heat** - one, two or three red waves
- **Cool** - the same in blue, on cars with ventilated seats
- **Auto** - waves plus the word `Auto`, the way the app labels it, so Auto
  is never mistaken for maximum heat

The steering wheel gets the same treatment with two steps rather than three,
matching the car. On models that expose only a plain on/off switch the card
falls back to that automatically.

## Running the tests

The card is one dependency-free file, so the only tooling here is the test
suite. It drives the real card in a real browser, because the bugs worth
catching in a custom card are the ones that only appear with genuine DOM
behaviour.

```
npm install
npm test
```

123 checks covering entity detection on both integrations, the per-car entity
overrides, the editor, the seat and wheel heat vocabularies, Bioweapon by model
and year, and the driving view including the geometry that keeps the wheels
rolling at the same speed as the road. It exits non-zero on failure.

It is worth knowing why it exists. In v1.1.0 a reported bug ("the editor keeps
reverting to the first vehicle") was diagnosed by reading the code, declared
fixed, and shipped still broken, because the real fault was a shadow-root
teardown that only shows up when a browser is actually running. Run against
v1.1.1 this suite fails on exactly the five things v1.1.2 fixed. If you are
changing detection or the editor, run it.

## Contributing an image pack

A pack is seven photos from the Tesla app:

`topdown.jpg` · `topdown-plugged.jpg` · `topdown-charging.jpg` · `side.jpg` · `side-plugged.jpg` · `side-charging.jpg` · `climate.jpg`

Partial packs are fine - the card probes each slot and uses what it finds.

Read [docs/pack-images.md](docs/pack-images.md) before you crop anything. The
one rule that matters is that a pack's three side photos share a canvas and put
the car in the same place on it; a pack that gets that wrong looks fine as three
pictures and wrong as a card.

### Which folder

**Name the folder after your car's body generation, not just its model.** A
refresh changes the bodywork, so photos of a Juniper Model Y do not stand in for
a pre-refresh one, and the unqualified folder is served to both. Contributing to
the unqualified folder is how a pre-refresh car ends up showing refreshed
bodywork, which is the one problem this is all here to avoid.

| Your car | Folder |
|---|---|
| Model Y, 2025 built or later (Juniper) | `images/models/y-juniper/<paint>/app/` |
| Model Y, pre-refresh | `images/models/y-classic/<paint>/app/` |
| Model 3, 2024 or later (Highland) | `images/models/3-highland/<paint>/app/` |
| Model 3, 2022 or earlier | `images/models/3-classic/<paint>/app/` |

The three generation slugs are `classic`, `juniper` and `highland`. `<paint>` is
lower case with anything that is not a letter removed, so Deep Blue Metallic is
`blue` and Pearl White Multi-Coat is `white`. If you are unsure which generation
you have, open the card, hover the car photo, and it tells you. See
[Body generations](#body-generations) for how the card works it out.

`images/models/<3|y>/<paint>/app/` without a generation still works and is what
the three packs bundled today use, for historical reasons. Do not add new packs
there.

### Then add it to the list

**A new pack must also be added to `PACKS_SHIPPED` in `tesla-fleet-card.js`,
with its `gen`:**

```js
const PACKS_SHIPPED = [
  { model: "Model Y", paint: "red", dir: "models/y/red/app", gen: "classic" },
  { model: "Model 3", paint: "blue", dir: "models/3-highland/blue/app", gen: "highland" }
];
```

That list is what the card shows a user whose model and paint have no artwork
yet, so it going stale is worse than useless: it either hides a pack that exists,
or sends someone to one that does not. A pack with no `gen` is treated as
matching any generation, which is almost never what you want.

Packs are served from `main`, so a merged pack is live for every user straight
away whatever card version they are running. No release needed.
