/* Tesla Fleet Card
   A Tesla-app-style, multi-car Lovelace card for Home Assistant.
   Works with both the tesla_custom (HACS) and official tesla_fleet
   integrations - auto-detected per car.
   Install guide, all options, and the image-pack spec live in the README:
   https://github.com/borgqueenx/sexy-home-assistant-tesla-card
   Built by Claude in conversation with MrNickIE - MIT licence, share freely. */
(function () {
  "use strict";

  const CARD_VERSION = "1.1.21";

  const PATTERNS = {
    battery: "sensor.{p}battery",
    range: "sensor.{p}range",
    charging: "binary_sensor.{p}charging",
    charger: "binary_sensor.{p}charger",
    charger_power: "sensor.{p}charger_power",
    charging_rate: "sensor.{p}charging_rate",
    energy_added: "sensor.{p}energy_added",
    charge_complete: "sensor.{p}time_charge_complete",
    charge_limit: "number.{p}charge_limit",
    charging_amps: "number.{p}charging_amps",
    charger_switch: "switch.{p}charger",
    /* tesla_custom exposes no charger-voltage entity at all, so this pattern
       never matched for any user. tesla_fleet does have one, so the key stays
       in both maps and only this side is blank. */
    charger_voltage: "",
    seat_fl: "select.{p}heated_seat_left",
    seat_fr: "select.{p}heated_seat_right",
    seat_rl: "select.{p}heated_seat_rear_left",
    seat_rc: "select.{p}heated_seat_rear_center",
    seat_rr: "select.{p}heated_seat_rear_right",
    steering_heat: "switch.{p}heated_steering",
    /* cars with a multi-level wheel expose BOTH a switch and a select. Prefer
       the select so Low and High are distinguishable; Patsy has only the
       switch, so the fallback matters. */
    steering_heat_sel: "select.{p}heated_steering_wheel",
    lock: "lock.{p}doors",
    charge_cable_lock: "",
    doors: "binary_sensor.{p}doors",
    windows_cover: "cover.{p}windows",
    frunk: "cover.{p}frunk",
    trunk: "cover.{p}trunk",
    charge_port: "cover.{p}charger_door",
    climate: "climate.{p}hvac_climate_system",
    inside_temp: "sensor.{p}temperature_inside",
    outside_temp: "sensor.{p}temperature_outside",
    online: "binary_sensor.{p}online",
    asleep: "binary_sensor.{p}asleep",
    shift: "sensor.{p}shift_state",
    speed: "sensor.{p}speed",
    location: "device_tracker.{p}location_tracker",
    sentry: "switch.{p}sentry_mode",
    software: "update.{p}software_update",
    last_update: "sensor.{p}data_last_update_time",
    refresh: "button.{p}force_data_update",
    flash: "button.{p}flash_lights",
    horn: "button.{p}horn",
    remote_start: "button.{p}remote_start",
    odometer: "sensor.{p}odometer",
    tpms_fl: "sensor.{p}tpms_front_left",
    tpms_fr: "sensor.{p}tpms_front_right",
    tpms_rl: "sensor.{p}tpms_rear_left",
    tpms_rr: "sensor.{p}tpms_rear_right",
    defrost_switch: "",
    cop: "select.{p}cabin_overheat_protection",
  };

  /* Official tesla_fleet integration - same keys, its own entity naming.
     Empty string = the integration has no such entity (the card hides that feature). */
  const PATTERNS_FLEET = {
    battery: "sensor.{p}battery_level",
    range: "sensor.{p}battery_range",
    charging: "sensor.{p}charging",             // a sensor here, not a binary_sensor
    charger: "binary_sensor.{p}charge_cable",
    charger_power: "sensor.{p}charger_power",
    charging_rate: "sensor.{p}charge_rate",
    energy_added: "sensor.{p}charge_energy_added",
    charge_complete: "sensor.{p}time_to_full_charge",
    charge_limit: "number.{p}charge_limit",
    charging_amps: "number.{p}charge_current",
    charger_switch: "switch.{p}charge",
    charger_voltage: "sensor.{p}charger_voltage",
    seat_fl: "select.{p}seat_heater_front_left",
    seat_fr: "select.{p}seat_heater_front_right",
    seat_rl: "select.{p}seat_heater_rear_left",
    seat_rc: "select.{p}seat_heater_rear_center",
    seat_rr: "select.{p}seat_heater_rear_right",
    steering_heat: "select.{p}steering_wheel_heater",  // a select here, not a switch
    steering_heat_sel: "",
    lock: "lock.{p}lock",
    charge_cable_lock: "lock.{p}charge_cable_lock",
    doors: "",
    windows_cover: "cover.{p}windows",
    frunk: "cover.{p}frunk",
    trunk: "cover.{p}trunk",
    charge_port: "cover.{p}charge_port_door",
    climate: "climate.{p}climate",
    inside_temp: "sensor.{p}inside_temperature",
    outside_temp: "sensor.{p}outside_temperature",
    online: "binary_sensor.{p}status",
    asleep: "",
    shift: "sensor.{p}shift_state",
    speed: "sensor.{p}speed",
    location: "device_tracker.{p}location",
    sentry: "switch.{p}sentry_mode",
    software: "update.{p}update",
    last_update: "",
    refresh: "button.{p}wake",
    flash: "button.{p}flash_lights",
    horn: "button.{p}honk_horn",
    remote_start: "button.{p}keyless_driving",
    odometer: "sensor.{p}odometer",
    tpms_fl: "sensor.{p}tire_pressure_front_left",
    tpms_fr: "sensor.{p}tire_pressure_front_right",
    tpms_rl: "sensor.{p}tire_pressure_rear_left",
    tpms_rr: "sensor.{p}tire_pressure_rear_right",
    defrost_switch: "switch.{p}defrost",
    cop: "climate.{p}cabin_overheat_protection",
  };

  const CARD_DEFAULTS = { accent: "#e82127", tpms_min: 38, default_car: 0, show_tpms: true, drive_speed: 1, show_vin: false, map_zoom: 15, location_tap: "map", preview: false };
  const CAR_DEFAULTS = { name: "Tesla", model: "", integration: "auto", image: "", image_side: "", image_charging: "", image_side_plugged: "", image_top_plugged: "", image_top_charging: "", cable: "overlay", cable_path: "", image_climate: "", images: "", port_xy: "159,47", port_top_xy: "40,692", climate_anchors: {}, top_anchors: {}, rest_anchors: {}, rest_anchors_unplugged: {}, climate_transition: {}, climate_controls_position: "left", rest_car_margin: "", rest_car_width: "", defrost_glass: {}, calibrate: false, hide_seats: [], hide_climate: [], show_climate: [], paint: "", prefix: "", drive_motion: "auto", road: null, wheels: null, location_tap: "", entities: {}, steering: "left", speed_entity: "", eta_entity: "", force_drive_anim: false, force_frunk_open: false, force_trunk_open: false, force_plugged: false, lights_lux_below: 50, lux_entity: "", light_angle: 28, light_beam_length: 82, light_beam_width: 16, light_source_size: 7, light_source_thickness: 3.5, light_star_size: 3.2, light_star_intensity: 0.9, light_spot_width: 2.8, light_spot_height: 1.4, light_spot_intensity: 0.82, daylight_points: [], daylight_thickness: 1.15, car_offset_x: 0, name_stats_gap: 0 };

  /* how long an assumed state is trusted before the real one wins back */
  const PEND_MS = 25000;
  /* Tesla entities drop to "unavailable" for a moment while the car wakes.
     For the physical states below, keep showing the last real reading for up
     to this long rather than flicking the frunk shut or the car unlocked. */
  const HOLD_MS = 5 * 60 * 1000;
  const HOLD_KEYS = { frunk: 1, trunk: 1, charge_port: 1, windows_cover: 1, lock: 1, charger: 1 };
  /* sentry is deliberately NOT held: Tesla makes it unavailable while the car
     is driving, and holding it would show sentry on for the start of a drive */

  /* ---- driving view ---------------------------------------------------
     Measured off a 60fps screen recording of the Tesla app's driving screen
     (884x1920). Every number here came off that file rather than out of my
     head, because the last several times I guessed at this card's visuals
     from reading code I was wrong:

       cycle        0.833 s   autocorrelation, identical at five probe points
       dash duty    1:2       duty cycle 0.32 at every probe
       dash colour  #2b2a2b   on a near-black ground
       stroke       6.4px of a 488px-wide car -> 1.31% of car width
       period       ~420px    -> 0.86 car widths between dash starts
       wheels       rotate counter-clockwise, by polar cross-correlation at
                    r=10..26 on both hubs

     The angle is NOT a constant. In the app the road lines sit at -24.6 deg
     and the car's own wheelbase sits at -24.1 deg: the markings run parallel
     to the direction of travel, so they track the camera angle of whatever
     render you are looking at. The bundled pack photo is a tighter, flatter
     three-quarter view whose wheelbase runs at about -12.6 deg, so copying
     the app's -24.6 across would have laid the road at a visibly wrong angle
     on the car it is drawn under. Each pack carries its own.

     What the app does and this card cannot: the app swaps to a 3D render, so
     its wheels genuinely turn and the car sits in the middle of a wide road.
     Our car is a photograph that nearly fills its frame, so only the near
     lane marking is in shot and the wheels get a swept arc drawn over them
     rather than real rotation. */
  const DRIVE = {
    /* The app runs 0.833s per dash period, so a marking sweeps past every
       0.83s. Measured, and wrong here: on a card a fraction of a phone
       screen's size that reads as frantic, which is what Nick called it. At
       1.7s a marking passes about every second and a half and it settles
       down. A road spec can override with its own cycle. */
    /* THE ROAD SPEED IS PROPORTIONAL TO THE CAR'S, and refCycle is the one
       number that sets it. Two tiers came first, from Nick's "below 20km is
       slow, above this it should be double", and two tiers were wrong: at 40
       and at 100 km/h you got exactly the same animation, so 40 read as half
       its real speed. Nick, watching Rachel: "Rachel is doing about 40kmph
       now and it looks about 20Kph in the animation".

       So: one dash period per refCycle seconds at refKph, scaled inversely
       with speed. Doubling the speed halves the period, all the way up and
       down, with a floor so a motorway does not strobe and a ceiling so a
       crawl does not look stopped.

       refCycle is deliberately the ONLY calibration number, and the card
       config can scale it live with drive_speed, so tuning this by eye needs
       a dashboard edit rather than a new build. */
    refKph: 40,            // the speed refCycle is calibrated at
    refCycle: 0.43,        // seconds per dash period at refKph  <-- THE KNOB
    /* The floor was 0.26 and the test suite caught that as a real fault, not
       a wrong expectation: 80 km/h already hit it, so everything above about
       66 km/h flattened to one speed and reproduced the exact complaint this
       change exists to fix. At 0.12 a dash period is still seven frames at
       60fps, and proportionality survives to about 143 km/h. */
    minCycle: 0.12,        // floor: below this the dashes strobe
    maxCycle: 3.4,         // ceiling: a crawl still shows movement
    dash: 1 / 3,           // fraction of the period that is painted
    colour: "#2b2a2b",
    /* The app's dash period is 0.86 car widths, which in its wide framing
       leaves 2.3 periods on screen. The pack photo is cropped far tighter, so
       0.86 put ONE dash in shot and it read as a scratch on the picture
       rather than a road. Halved, so the same number of dashes is visible as
       the app shows - keeping the appearance rather than the constant. */
    period: 0.45,          // dash period as a fraction of car width
    width: 0.0131          // stroke width as a fraction of car width
  };

  /* Per-pack ground plane, in Rest view units (233 x 108). angle is the line
     through the two tyre contact patches - the lowest point of the car's
     silhouette under each wheel - because a lane marking on the ground runs
     parallel to the direction of travel, and so does the line joining the
     front and rear contact patches on the same side of the car.

     Contact patches beat hub centres and hub bottoms here. The far wheel is
     drawn smaller by perspective, so a line through the hubs is too shallow,
     and the wheels are ellipses so the bottom of a fitted circle is not where
     the tyre meets the road. Reading the silhouette directly is stable to
     0.4 degrees across luma thresholds from 30 to 38.

     The three packs come out at -21.90, -21.78 and -21.78, which is the check
     that this is measured and not invented: one camera rig photographing
     three different cars should agree, and it does, to about a tenth of a
     degree. (Earlier eyeball readings off a grid gave -12.6, -33.6 and -20.4.
     All three were wrong. Measure the pixels.) The app's own driving render
     sits at -24.6 because it is a different camera, which is exactly why this
     cannot be one shared constant.

     lines is [y, stroke] where y is the marking's height at the middle of the
     frame, sitting about 7 units in front of the car's own ground line. One
     marking, not two: two read as a hatch rather than a road. Absolute rather
     than relative to the runtime car box, because that box is a luma
     threshold that swallows the shadow by a different amount in each photo. */
  /* ---- the two Model Y Juniper packs share one set of measurements ----
     The white Juniper and the blue Juniper are the SAME Tesla app render in a
     different colour, so once their side photos share a frame they share
     their geometry too, and it is one set of numbers instead of two that
     drift apart.

     They did not share one until 2026-09-03. The white pack's three side
     photos had been cropped independently: the car came out 506, 470 and 542
     pixels wide across two different canvas heights, so no single cable path
     or wheel ellipse could sit on all three, and the charging frame visibly
     jumped in size when a car started charging. The three were re-framed onto
     the blue pack's 660x400 canvas. The scale for each was solved by
     cross-correlating edge gradients against the blue frame -- gradients
     because they survive the change of paint colour, which plain pixels do
     not -- and the three answers, 1.155, 1.225 and 1.060, agree to a
     thousandth with the ratio of the independently measured car boxes. Two
     methods that share no arithmetic landing on the same number is what makes
     this worth trusting.

     Nick's rule, and it is the right one: THE BASE IMAGES FOR THE SAME MODEL
     MUST MATCH POSITION TO WORK. docs/pack-images.md writes it down.

     One trap worth naming, because it looks like an error and is not: `angle`
     below is -18.3 where every other pack reads about -21.8. The road really
     is at the same angle in all of them. The Rest view is 233 x 108 with
     preserveAspectRatio="none", so a 660x400 photo and a 660x330 photo squash
     y by different amounts and the SAME physical line arrives at a different
     angle in view units. An angle measured on one canvas cannot be copied to
     another without re-deriving it. */
  const Y_JUNIPER_SIDE = {
    wheels: { lift: 0.85, front: [105.4, 86.8, 14.17, 11.14, 119.5],
              rear: [202.1, 54.8, 0.84] },
    road:   { angle: -18.3, lines: [[99.3, 2.2]] },
    cable:  "M 55.1 104.5 C 55.7 104.4 57.7 104.1 59.0 103.9 C 60.3 103.6 61.6 103.3 62.9 103.1 " +
      "C 64.2 102.8 65.5 102.6 66.8 102.3 C 68.1 102.1 69.4 101.8 70.7 101.6 " +
      "C 72.0 101.3 73.3 101.0 74.6 100.8 C 75.9 100.6 77.2 100.4 78.5 100.2 " +
      "C 79.8 100.0 81.2 99.8 82.5 99.6 C 83.8 99.4 85.1 99.2 86.4 99.0 " +
      "C 87.8 98.9 89.1 98.7 90.4 98.5 C 91.7 98.3 93.0 98.1 94.4 98.0 " +
      "C 95.7 97.8 97.0 97.6 98.3 97.4 C 99.6 97.1 100.9 96.9 102.2 96.7 " +
      "C 103.6 96.5 104.9 96.4 106.2 96.1 C 107.5 95.9 108.8 95.5 110.0 95.2 " +
      "C 111.3 94.8 112.5 94.4 113.7 93.9 C 114.9 93.5 116.0 92.9 117.0 92.2 " +
      "C 118.0 91.6 119.0 90.8 119.7 90.0 C 120.5 89.1 121.0 88.2 121.4 87.2 " +
      "C 121.8 86.2 121.9 85.2 122.2 84.2 C 122.5 83.2 122.9 82.2 123.2 81.2 " +
      "C 123.5 80.2 123.8 79.2 124.1 78.2 C 124.4 77.2 124.6 76.2 124.9 75.2 " +
      "C 125.1 74.2 125.4 73.2 125.6 72.2 C 125.9 71.2 125.9 70.1 126.3 69.1 " +
      "C 126.6 68.1 127.2 67.2 127.7 66.2 C 128.1 65.3 128.5 64.3 129.0 63.4 " +
      "C 129.6 62.4 130.0 61.4 130.7 60.5 C 131.4 59.7 132.2 58.9 133.1 58.1 " +
      "C 134.0 57.3 135.4 56.3 135.9 55.9"
  };

  /* The Highland Model 3 pack was re-framed on the same day and the same rule,
     but by a different route, and the difference is instructive.

     Its plugged and charging photos turned out to be the SAME app render at the
     same scale, differing only in canvas height, 330 against 375: edge-gradient
     correlation put them at scale 1.000, offset (0, -14), ncc 0.96. So charging
     became plugged's frame by a pure crop, 14 rows up, with no resampling at
     all. Only the parked photo needed rescaling, by 1.040.

     That scale could NOT come from correlation, because parked is a front
     three-quarter render and the other two are rear three-quarter: the peak sat
     at ncc 0.16, which is the tell that a correlation answer is worthless. It
     came instead from two invariants that do survive a change of pose,
     silhouette width (487/468 = 1.041) and silhouette height (293/282 = 1.039),
     which agree. The check that it was right: at that scale, with the bottom
     edge aligned, all four edges of the car's box land on the plugged frame's,
     which nothing in the fit was asking for.

     AND THE ROAD ANGLE HERE DID NOT CHANGE, where the Juniper's did. That is
     not an inconsistency. The Juniper's canvas went from 330 to 400, so the
     view's y squash changed and the angle had to be re-derived; the Highland
     stayed on 330 and the transform is a uniform scale, so the angle in view
     units is untouched and only the line's height moves. The rule is that the
     angle follows the CANVAS, not the crop. */
  /* ---- which car is selected has to outlive the element ----------------
     Issue #1, reported three times, fixed twice at the wrong layer.

     HA 2026.9's card editor DESTROYS AND REBUILDS the preview element on every
     config change. Verified on a real dashboard rather than reasoned about:
     tag the element, click the second car, change one Paint dropdown, and the
     element in the dialog is a DIFFERENT OBJECT with _sel back at 0 and the
     first car on screen. Editing the YAML directly does it too, which is what
     ruled out the dropdown handling.

     So v1.1.0 and v1.1.2 both kept the selection across setConfig, and both
     were right about the code and wrong about the problem: by the time it
     would have mattered there was no instance left to keep it on. The lesson
     is the one this project keeps relearning. A synthetic harness reusing one
     element could never reproduce this, and did not, twice.

     Module scope is loaded once per page, so it survives the rebuild. Keyed on
     the cars so two cards on one dashboard keep their own selection, and keyed
     on PREFIX rather than name so that editing a name does not lose your
     place. Position stands in for a car with no prefix. Editing a prefix does
     reset it, which is one keystroke's worth of annoyance in the rarest edit.

     This is a page-lifetime memory, not a stored setting: a fresh load starts
     from default_car again, which is what that option is for. */
  const LAST_SEL = new Map();
  const SEL_MEMORY_MAX = 8;
  function selKey(cars) {
    return (cars || []).map((c, i) => String((c && c.prefix) || ("#" + i))).join("|");
  }
  function rememberSel(key, i) {
    if (!key) return;
    LAST_SEL.delete(key);                       // re-insert so it is newest
    LAST_SEL.set(key, i);
    while (LAST_SEL.size > SEL_MEMORY_MAX) LAST_SEL.delete(LAST_SEL.keys().next().value);
  }

  const PACK_ROAD = {
    "models/y/red/app":          { angle: -21.9, lines: [[93.3, 2.2]] },
    "models/y/white/app":        Y_JUNIPER_SIDE.road,
    "models/y-juniper/blue/app": Y_JUNIPER_SIDE.road,
    "models/3/grey/app":         { angle: -21.8, lines: [[103.1, 2.3]] }
  };
  /* An unmeasured photo still gets a marking: the measured car box's bottom
     edge lands about 2 units below the tyre contact line on all three bundled
     packs, so it stands in for the ground, and -21.8 is what they agree on. */
  const ROAD_DEFAULT = { angle: -21.8, drops: [[9, 2.2]] };

  /* ---- the wheels ----------------------------------------------------
     The first attempt at this drew four faint arcs over each hub and span
     them. Nick's verdict was one word: horrific, and he was right, because
     it put invented geometry on top of a photographed wheel.

     This rotates the photograph's own pixels instead. The pack image is
     drawn a second time inside the overlay, clipped to the wheel, and
     spun about the hub, so the spokes that turn are the real ones with
     their real colour and lighting.

     Two things have to be right or it wobbles instead of turning.

     ONE: the wheel is an ELLIPSE, so the pixels must be un-squashed to a
     circle, rotated, and squashed back. Getting the squash AXIS wrong was
     the mistake that cost the most here. I assumed it ran along the car's
     direction of travel, on the reasoning that the wheel is a circle in
     the car's side plane. That is true and still gives the wrong answer:
     under projection the two in-plane directions do not stay
     perpendicular, so the ellipse's own principal axes are what a
     rotation has to be built from, and they are nowhere near the travel
     line. These wheels lean 5 to 23 degrees off vertical. Nick spotted it
     immediately from an overlay: "those overlap lines you drew are not
     matching the wheel shape".

     Each wheel is therefore a full ellipse: centre, major semi-axis a,
     minor semi-axis b, and the major axis angle. Fitted by second moments
     over the wheel's own pixels, re-masked to the fitted ellipse and
     refitted four times so the centre settles onto the hub. A centre off
     by a unit is a visible wobble, so this is worth doing properly.

     TWO: the rear wheel cannot be fitted from its own pixels, and must be
     DERIVED FROM THE FRONT ONE. Both near-side wheels lie in the same plane
     of the car, and these renders are close enough to a long lens that
     circles in that plane project to ellipses of the same shape and lean,
     differing only in position and size. Fitting the rear independently gave
     91 degrees against the front's 109, and far too narrow. Nick spotted that
     from an overlay too: "the back is still off. They are BOTH the same
     angle.... (as the front)". He was right, and the reason the fit failed is
     instructive: the rear tyre is dark against dark ground on one side and
     dark shadow on the other, so a mask loses its width, while leaking down
     into the shadow gains it height. Both errors push the same way, towards
     an ellipse too narrow and too upright, which is exactly what came out.

     So a pack stores the front ellipse in full and the rear as nothing but a
     centre and a scale. The shape and the lean are shared by construction,
     which is the point: the invariant is in the data model rather than in two
     numbers that have to agree, so it cannot drift apart again.

     The rear also takes the front's PIXELS. It is the same wheel, it is only
     about sixteen source pixels across, and it is the more obliquely viewed
     of the two, so un-squashing its own pixels turns them into vertical
     streaks. Borrowing the front's gives several times the detail with the
     correct perspective; a per-pack brightness lift covers the rear sitting
     in slightly less shadow.

     Three copies a few degrees apart at a third opacity each give a light
     motion blur, which is what a camera sees and which also softens what
     is left of the resampling. */
  const WHEEL = {
    /* No fixed duration. A wheel that does not roll with the road it is on is
       the first thing the eye picks up, and mine did not: Nick, watching Patsy
       at speed, "the wheel speed is also slighly faster than the road speed I
       think". Measured, it was 1.76 times the road, so the rotation period is
       now DERIVED from the road rather than being a second free number.

       One revolution advances the contact patch by the wheel's circumference,
       and in the image that distance is 2*pi times the ellipse's SEMI-DIAMETER
       ALONG THE DIRECTION OF TRAVEL. That is exact, and it is exact for a
       pleasing reason: the contact point is where the rim's tangent runs
       parallel to the road, the tangent at a point of an ellipse is parallel
       to its conjugate diameter, and the speed there works out to the length
       of the semi-diameter in the direction of travel.

       Two wrong answers were tried first, and both were plausible. Taking the
       minor semi-axis b is 12% low, because the minor axis is not quite the
       travel direction. Taking the rim speed at the ellipse's LOWEST point is
       worse and misleading: the lowest point of any curve has a horizontal
       tangent, so that always claims the wheel is running horizontally, and
       comparing it against a road at -21.9 degrees looked like a 158 degree
       error that was really the wrong point.

       Set that against the road's own speed, one dash period per cycle, and
       the period falls out. It stays right at both tiers and on any pack. */
    /* The wheel must NOT have a floor of its own. It had 0.18s, and a speed
       sweep showed the road running at 0.12s at 120 km/h while the wheel sat
       clamped at 0.18 - decoupled by half, which is the very fault this
       derivation was written to fix, just moved up the speed range. The road's
       own floor is the single limit now.

       Strobing is handled by BLUR instead, which is the honest fix. A wheel
       with ten repeating features aliases at 60fps once it turns more than 18
       degrees per frame, and 6/dur degrees per frame means anything under
       about 0.33s per revolution aliases - roughly 55 km/h and up. An aliased
       wheel reads as slow, stopped, or backwards, so this was very likely part
       of why the animation still felt slow after the road was right.

       So the motion blur widens with speed: the smear is kept wider than the
       per-frame rotation, which leaves nothing sharp to alias, and a fast
       wheel becomes a smooth ring exactly as a camera records one. */
    minDur: 0.05,    // effectively never binds; the road's floor governs
    blurCover: 2.2,  // smear width as a multiple of the per-frame rotation
    maxSpread: 130,  // degrees, beyond which the ring is smeared enough
    maxCopies: 5,    // each copy is a full image draw; keep the cost bounded
    clip: 1.02,      // slight output overscan
    face: 0.76,      // fraction of the tire ellipse occupied by the rotating wheel face
    copies: 3,       // stacked copies making the motion blur
    spread: 18       // degrees between the first and last copy
  };

  /* front: [cx, cy, a, b, majorAngle] in Rest view units, where a is the
     major semi-axis, b the minor, and majorAngle is degrees from the positive
     x-axis with y downward. rear: [cx, cy, scale] - it borrows the front's
     shape and lean, scaled. lift: the rear's brightness relative to the
     front. Fitted on the FRONT wheel only, which is the one that sits against
     bright bodywork and so masks cleanly.

     The rear centre and scale are then found by TEMPLATE MATCHING: warp the
     front wheel's own pixels over the rear at each candidate centre, scale
     and rotation, and keep the best normalised cross-correlation. That is the
     right tool here because it uses every pixel of the wheel rather than a
     threshold, it is untroubled by the low contrast that defeated masking,
     and it measures exactly what the rendering does. It scores 0.78 on the
     red Y and 0.84 on the Model 3, which is a firm match, and 0.57 on the
     white Y, whose flat aero covers carry less structure to match.

     The method was validated before it was trusted. Nick had confirmed that
     the white Y's rear wheel sat correctly and the other two did not ("The
     white one is the correct position! use that!"), so the matcher was run on
     the white one first: it moved that centre by a tenth of a view unit,
     while shifting the other two by up to 2.7. Agreeing with the known-good
     case is what makes the other two answers worth believing. Eyeballing had
     by that point produced three different verdicts on the same wheel. */
  const PACK_WHEELS = {
    "models/y/red/app":          { lift: 1.26, front: [106.9, 77.9, 15.65, 10.99, 109.3],
                                   rear: [185.2, 47.8, 0.85] },
    "models/y/white/app":        Y_JUNIPER_SIDE.wheels,
    "models/y-juniper/blue/app": Y_JUNIPER_SIDE.wheels,
    "models/3/grey/app":         { lift: 1.06, front: [107.4, 86.3, 15.80, 10.74, 95.7],
                                   rear: [191.4, 54.4, 0.86] }
  };

  /* expand rear: [cx, cy, scale] into a full ellipse using the front's shape */
  function rearEllipse(front, rear) {
    if (!front || !rear || front.length < 5 || rear.length < 3) return null;
    const s = rear[2] > 0 ? rear[2] : 1;
    return [rear[0], rear[1], front[2] * s, front[3] * s, front[4]];
  }

  /* Rotate the wheel photographed at `src` and land it in the ellipse `dst`.
     Both are [cx, cy, a, b, phi]. The transform is M . rotate . M-inverse,
     where M squashes a circle into the ellipse: that is the only form that
     turns an ellipse in its own plane rather than skewing it. */
  function spinWheel(id, src, dst, lift, dur) {
    if (!src || !dst || src.length < 5 || dst.length < 5) return "";
    const [sx, sy, sa, sb, sp] = src, [dx, dy, da, db, dp] = dst;
    if (!(sa > 0 && sb > 0 && da > 0 && db > 0)) return "";
    const scale = da / sa;
    const cover = WHEEL.clip;
    const face = WHEEL.face;
    const out = `translate(${dx} ${dy}) rotate(${dp}) scale(${cover} ${cover}) scale(1 ${(db / da).toFixed(4)})` +
                ` rotate(${-dp}) scale(${scale.toFixed(4)})`;
    const inn = `rotate(${sp}) scale(1 ${(sa / sb).toFixed(4)}) rotate(${-sp})` +
                ` translate(${-sx} ${-sy})`;
    const moving = dur > 0;
    const maskR = Math.max(sa, sb) * 1.2;
    const layers = `<g transform="${out}">
      <g transform="rotate(0)">
        ${moving ? `<animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="${dur}s" repeatCount="indefinite"/>` : ""}
        <g transform="${inn}" mask="url(#dwM${id})"${lift ? ` filter="url(#dwLift)"` : ""}><use href="#dwImg"/></g>
      </g>
    </g>`;
    /* Spin only the inner wheel face. The tyre sidewall and its lighting stay
       in the source photo; a feathered mask blends the moving face into them. */
    return `<mask id="dwM${id}" mask-type="luminance" maskUnits="userSpaceOnUse" x="${sx-maskR}" y="${sy-maskR}" width="${maskR*2}" height="${maskR*2}">` +
      `<ellipse cx="${sx}" cy="${sy}" rx="${(sa * face).toFixed(2)}" ry="${(sb * face).toFixed(2)}" transform="rotate(${sp} ${sx} ${sy})" fill="white" filter="url(#dwWheelFeather)"/></mask>` +
      `<clipPath id="dwC${id}"><ellipse cx="${dx}" cy="${dy}" rx="${(da * cover).toFixed(2)}"` +
      ` ry="${(db * cover).toFixed(2)}" transform="rotate(${dp} ${dx} ${dy})"/></clipPath>` +
      `<g clip-path="url(#dwC${id})">${layers}</g>`;
  }
  /* seconds per revolution such that the contact patch keeps pace with the
     road it is drawn on */
  function wheelPeriod(wheels, cw, cycle, roadAngle) {
    const f = wheels && wheels.front;
    if (!f || f.length < 5 || !(cycle > 0)) return null;
    const a = f[2], b = f[3];
    if (!(a > 0 && b > 0)) return null;
    /* the ellipse's semi-diameter along the direction of travel */
    const al = ((roadAngle || 0) - f[4]) * Math.PI / 180;
    const ca = Math.cos(al) / a, sa = Math.sin(al) / b;
    const q = ca * ca + sa * sa;
    if (!(q > 0)) return null;
    const perRev = 2 * Math.PI / Math.sqrt(q);
    const roadSpeed = Math.max(8, cw * DRIVE.period) / cycle;
    if (!(roadSpeed > 0)) return null;
    return Math.max(WHEEL.minDur, perRev / roadSpeed);
  }

  function driveWheels(wheels, src, dur) {
    if (!wheels || !wheels.front || !wheels.rear || !src) return "";
    const lift = wheels.lift || 1;
    return `<defs>
      <image id="dwImg" href="${src}" x="0" y="0" width="233" height="108" preserveAspectRatio="none"/>
      <filter id="dwWheelFeather" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="0.65"/></filter>
      <filter id="dwLift" x="-10%" y="-10%" width="120%" height="120%">
        <feComponentTransfer>
          <feFuncR type="linear" slope="${lift}"/><feFuncG type="linear" slope="${lift}"/>
          <feFuncB type="linear" slope="${lift}"/>
        </feComponentTransfer>
      </filter></defs>
      <g class="wheelsBounce">` +
      spinWheel("f", wheels.front, wheels.front, 0, dur) +
      spinWheel("r", wheels.front, rearEllipse(wheels.front, wheels.rear), 1, dur) +
      `</g>`;
  }

  /* Dashed lane markings sliding along their own axis. The slide is
     stroke-dashoffset rather than a transform, so the dashes travel along
     the line instead of the whole line drifting across the frame. */
  function driveRoad(w, h, box, road, cycle, edgeBounds) {
    if (!road || !((road.lines && road.lines.length) || (road.drops && road.drops.length))) return "";
    const cw = (box && box.length === 4 && box[2] > box[0]) ? box[2] - box[0] : w * 0.71;
    const origAngle = road.angle || 0;
    const rad = origAngle * Math.PI / 180;
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const len = (Math.abs(w * dx) + Math.abs(h * dy)) * 4.0;
    const period = Math.max(8, cw * DRIVE.period);
    const on = period * DRIVE.dash;
    const cx = w / 2;
    const origSpec = road.lines ||
      (road.drops || []).map((d) => [Math.min(h - 3,
        (box && box.length === 4 ? box[3] : h * 0.85) + d[0]), d[1]]);

    /* Build a two-line spec: the car drives BETWEEN the two lines.
       Line 0 = near side (below/in front of the car, viewer side)
       Line 1 = far side (above/behind the car, clipped to not overlay the body) */
    let spec;
    if (origSpec.length >= 2) {
      spec = origSpec;  // already has two or more lines
    } else {
      const baseY = origSpec[0][0];
      const baseW = origSpec[0][1] || cw * DRIVE.width;
      // Near line: at the original position (below the wheels)
      // Far line: shifted upward by ~40px so the car sits between them
      spec = [
        [baseY, baseW],
        [Math.max(10, baseY - 40), baseW * 0.6]
      ];
    }

    // Clip both road stripes to the card's horizontal edges and the image's
    // vertical bounds, so they can enter/exit the card without reaching menus.
    const clipLeft = edgeBounds && Number.isFinite(edgeBounds.left) ? edgeBounds.left : 0;
    const clipRight = edgeBounds && Number.isFinite(edgeBounds.right) ? edgeBounds.right : w;
    let html = `<clipPath id="drRoadClip"><rect x="${clipLeft.toFixed(2)}" y="0" width="${Math.max(0, clipRight - clipLeft).toFixed(2)}" height="${h}"/></clipPath>`;
    // Additional clip for the far line: hide it where it would overlap the car body
    let farClipUsed = false;
    if (road.clip) {
      let farClip = String(road.clip);
      html += `<clipPath id="drFarClip">${farClip}</clipPath>`;
      farClipUsed = true;
    } else if (box && box.length === 4) {
      html += `<clipPath id="drFarClip"><rect x="-50" y="0" width="${Math.max(0, box[0]) + 50}" height="${h}"/><rect x="${box[2]}" y="0" width="${w - box[2]}" height="${h}"/></clipPath>`;
      farClipUsed = true;
    }

    return html + spec.map((ln, i) => {
      const cy = ln[0];
      const sw = Math.max(0.8, ln[1] || cw * DRIVE.width);
      /* Both lines start from the same offset (0) and animate the same distance
         in the same duration so they travel at identical visual speed. */
      const anim = cycle > 0
        ? `<animate attributeName="stroke-dashoffset" from="0"
                 to="${(-period).toFixed(1)}" dur="${cycle}s" repeatCount="indefinite"/>`
        : "";
      // Near line (index 0): no clip-path needed; the SVG's overflow:hidden clips
      // it at the viewport edge identically to how the far line's clip rect ends.
      // Far line (index >= 1): clips to regions outside the car body.
      const clip = (i >= 1 && farClipUsed)
        ? ' clip-path="url(#drFarClip)"'
        : '';
      /* Both lines use the same centre (cx) and the same half-length so their
         raw x2 is identical; the SVG viewBox / clip rect trims the right end
         identically for both.  Do NOT adjust the midpoint per-line — that is
         what caused the "top stripe goes further right" illusion in earlier
         versions.  The real fix is to extend len enough that both lines reach
         well past the right edge so the clip does the trimming, not the endpoint. */
      const x1 = (cx - dx * len / 2).toFixed(1);
      const y1 = (cy - dy * len / 2).toFixed(1);
      const x2 = (cx + dx * len / 2).toFixed(1);
      const y2 = (cy + dy * len / 2).toFixed(1);      return `<g clip-path="url(#drRoadClip)"><line x1="${x1}" y1="${y1}"
            x2="${x2}" y2="${y2}"
            stroke="${DRIVE.colour}" stroke-width="${sw.toFixed(2)}" stroke-linecap="butt"
            stroke-dashoffset="0"
            stroke-dasharray="${on.toFixed(1)} ${(period - on).toFixed(1)}"${clip}>${anim}
      </line></g>`;
    }).join("");
  }

  /* Position 10 of a VIN is the model year. The sequence skips I, O, Q, U and
     Z to avoid confusion with digits. Checked against Nick's own fleet, whose
     VINs came out 2020, 2022, 2023, 2023, 2023 and 2024 - and the 2023 Model Y
     is the one that correctly keeps its Bioweapon button, since the filter
     went onto the Model Y line in June 2021. */
  const VIN_YEAR = { A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016,
    H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024,
    S: 2025, T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030 };

  const PAINT_COLORS = { red: "#a4232e", grey: "#5c5e62", gray: "#5c5e62", white: "#f2f3f5",
    black: "#171a20", blue: "#1f3a93", silver: "#c8c9cb" };

  /* Packs that ship with the repo. Keep in step with images/models/. The card
     lists these when a car has no pack of its own, so nobody is left guessing
     what exists - and so an unsupported combination is a nudge to build one
     rather than a dead end. */
  /* Packs that ship with the repo. `gen` matters and was missing: the two
     Model Y packs are DIFFERENT GENERATIONS - the red is the pre-refresh car
     and the white is the 2025 refresh, "Juniper" - and with model and paint as
     the only keys, a pre-refresh white Y was being handed Juniper bodywork and
     a Juniper red Y the old shape, silently. Nick spotted it from the images.

     Recording the generation does three things: a contributed pack at a
     generation-qualified path is now preferred automatically, the card can say
     when it is showing the wrong one, and the README can be honest about it.
     The fallback is deliberately unchanged - right colour, wrong bodywork -
     because paint is what the user actually configured and a wrong colour is
     the more jarring of the two. */
  const PACKS_SHIPPED = [
    { model: "Model Y", paint: "red", dir: "models/y/red/app", gen: "classic" },
    { model: "Model Y", paint: "white", dir: "models/y/white/app", gen: "juniper" },
    { model: "Model Y", paint: "blue", dir: "models/y-juniper/blue/app", gen: "juniper" },
    { model: "Model 3", paint: "grey", dir: "models/3/grey/app", gen: "highland" }
  ];
  const GEN_LABEL = { classic: "pre-refresh", juniper: "Juniper (2025 refresh)",
                      highland: "Highland (2024 refresh)" };
  const PACK_DEFAULT = PACKS_SHIPPED[0];        // red Model Y

  /* PREVIEW STATES. Every overlay the card can draw, on demand, so a state
     can be looked at without waiting for a car to be in it. This exists
     because the whole of 2026-09-02 was spent comparing overlays against the
     Tesla app one real car at a time, and because the v1.1.4 demo switch was
     deleted for being a hidden global that forced EVERY car to look like it
     was driving. This is the opposite: opt-in per card, one car at a time,
     and it patches only what the card READS. Commands are untouched, so a
     preview can never send anything to a real car. */
  const PREVIEWS = [
    ["off",      "Live"],
    ["parked",   "Parked"],
    ["plugged",  "Plugged"],
    ["charging", "Charging"],
    ["slow",     "20 km/h"],
    ["fast",     "100 km/h"],
    ["defrost",  "Defrost"],
    ["pet",      "Pet Mode"],
    ["camp",     "Camp"],
    ["offline",  "Offline"]
  ];
  const PREVIEW_PATCH = {
    parked:   { shift: { state: "P" }, charger: { state: "off" },
                charging: { state: "off" }, location: { attributes: { speed: null } } },
    plugged:  { charger: { state: "on" }, charging: { state: "off" },
                shift: { state: "P" }, location: { attributes: { speed: null } } },
    charging: { charger: { state: "on" }, charging: { state: "on" },
                charger_power: { state: "11" }, charging_rate: { state: "48" },
                shift: { state: "P" }, location: { attributes: { speed: null } } },
    /* Tesla makes sentry unavailable on the move, so the driving states do too */
    slow:     { shift: { state: "D" }, charger: { state: "off" },
                charging: { state: "off" }, location: { attributes: { speed: 20 } },
                sentry: { state: "unavailable" } },
    fast:     { shift: { state: "D" }, charger: { state: "off" },
                charging: { state: "off" }, location: { attributes: { speed: 100 } },
                sentry: { state: "unavailable" } },
    defrost:  { climate: { state: "heat_cool", attributes: { preset_mode: "defrost" } } },
    pet:      { climate: { state: "heat_cool", attributes: { preset_mode: "dog" } } },
    camp:     { climate: { state: "heat_cool", attributes: { preset_mode: "camp" } } },
    offline:  { online: { state: "off" } }
  };

  /* The generation of every pack THIS REPO ships, keyed by its folder. This is
     what lets the card refuse to serve a car the wrong bodywork: the folder
     models/3/grey/app is the Highland pack, it is just named from before
     generations were a thing. */
  const SHIPPED_GEN = {};
  PACKS_SHIPPED.forEach((p) => { if (p.dir && p.gen) SHIPPED_GEN[p.dir] = p.gen; });

  /* The same photo set can sit at either spelling of its folder: the
     historical `models/3/grey/app`, or the generation-qualified
     `models/3-highland/grey/app` that this repo or a user may rename it to.
     THE MEASURED GEOMETRY BELONGS TO THE PHOTOGRAPHS, NOT TO THE PATH, so
     both spellings must resolve to the same numbers. Renaming a local pack
     folder is exactly how this broke once: the wheels silently stopped
     turning and the road marking moved, because the URL no longer contained
     the key the measurements are filed under. */
  const PACK_ALIAS = {};
  PACKS_SHIPPED.forEach((p) => {
    if (!p.dir || !p.gen) return;
    /* A pack whose folder ALREADY carries its generation - models/y-juniper -
       needs no alias, and deriving one anyway produced models/y-juniper-juniper,
       a folder nobody will ever have. */
    if (new RegExp("^models/[^/]+-" + p.gen + "/").test(p.dir)) return;
    const q = p.dir.replace(/^models\/([^/]+)\//, "models/$1-" + p.gen + "/");
    if (q !== p.dir) PACK_ALIAS[q] = p.dir;
  });
  /* A LEAN PACK ships 4 files and lets the card draw the cable.
     Nick's idea, and the card already had the parts: it draws and animates
     #cableP (blue plugged, green charging) for any car without a pack, and
     port_xy / port_top_xy / cable_path already aim it. All that was missing
     was a way for a PACK to say "draw it, do not expect it baked in".

     A CONTRIBUTOR SUPPLIES FOUR screenshots: home resting, home plugged,
     Controls, Climate. topdown-plugged and topdown-charging then come from the
     overlay, and side-charging is generated at build time by hue-rotating the
     baked cable. So five files ship, four are shot, and a genuinely-charging
     screenshot is never needed.

     THE OVERLAY IS FOR THE TOP-DOWN ONLY. The app swings to a rear
     three-quarter only when a cable is ATTACHED, so no render exists of that
     angle with the charge port flap open and no cable in it. The side view
     therefore has nowhere to draw a cable into and keeps its baked one. The
     top-down keeps one camera throughout, so there only the cable changes.

     Anchors are in the card's own view units, per pack, because the port sits
     somewhere different in every crop. A pack with no entry here keeps the
     old baked-cable behaviour, so nothing that ships today changes. */
  /* Where the cable lies in each pack's own side photograph, in overlay units.
     v1.0.0 drew green dashes along the photographed cable while charging and
     nothing else -- no second cable, no glow -- so the animation sat on top of
     the image. v1.0.1 replaced that with an early return and it has been static
     ever since; Nick noticed and was right. These are traced from the packs'
     charging photos. Two traps, both hit: the cable is near-VERTICAL where it
     leaves the port, so column sampling cuts the corner; and along the ground
     it is a pale, almost colourless line, so a hue mask cannot see it at all --
     that stretch is found with a white top-hat and joined at the knee, then the
     whole thing is resampled along arc length so the corner keeps its shape.
     The top end runs past the last lit pixel: the cable bends right into the
     black connector body, so the search window tracks that drift instead of
     assuming the run stays vertical, and the path ends at the connector.
     Fitted with 14 knots and NO smoothing: smoothing the knots pulled the
     curve off the cable by up to 6px at the bend. Unsmoothed it sits within
     1.9px of the traced centreline. The last stretch into the connector was
     still straight until the top was retraced as "not red" rather than by hue:
     in shadow against red bodywork that is the only stable test, and it is what
     revealed the inward curve. Last trap: the ground sweep and the vertical
     run OVERLAP by a few px at the knee and were sampled on different axes,
     so stitching them raw made the path go right, jump back left, then up --
     a visible wiggle. Both are trimmed back from the corner and the spline
     carries the turn. And the raw row-medians jitter about a pixel per row
     where the cable crosses the dark WHEEL -- low contrast makes the mask edge
     wobble -- which reads as a wiggle once sampled into knots, so each segment
     is replaced by a cubic fit first. 18 knots, within 1.6px of the raw trace,
     and x never reverses anywhere along it. */
  /* Where each pack's charge port sits in its CLIMATE photo, in that overlay's
     units. The card default was calibrated against one pack and is wrong for
     every other, which put the bolt out in open air. Measured from the baked
     cable where a pack has one, otherwise mapped across by fraction of the
     car's body box -- these are all the same Tesla top-down render. */
  const PACK_CLIM_PORT = {
    "models/3/grey/app":       [61, 461],
    "models/y/red/app":        [44, 501],
    "models/y/white/app":      [56, 477],
    "models/y-juniper/blue/app": [60, 499]
  };

  const PACK_CABLE_PATH = {
    "models/3/grey/app":
      "M 63.2 105.1 C 63.9 104.9 65.8 104.2 67.1 103.8 C 68.5 103.4 69.8 103.0 71.1 102.7 " +
      "C 72.5 102.2 73.8 101.8 75.1 101.4 C 76.4 101.1 77.8 100.7 79.1 100.4 " +
      "C 80.5 100.1 81.8 99.8 83.2 99.5 C 84.6 99.2 85.9 99.0 87.3 98.7 " +
      "C 88.7 98.5 90.0 98.2 91.4 98.0 C 92.8 97.8 94.1 97.5 95.5 97.3 " +
      "C 96.9 97.0 98.2 96.8 99.6 96.5 C 101.0 96.3 102.3 96.1 103.7 95.8 " +
      "C 105.1 95.5 106.4 95.3 107.8 95.1 C 109.1 94.8 110.5 94.5 111.8 94.2 " +
      "C 113.2 93.8 114.5 93.4 115.7 92.8 C 117.0 92.3 118.3 91.6 119.2 90.6 " +
      "C 120.2 89.7 120.8 88.6 121.4 87.4 C 122.1 86.3 122.6 85.1 123.2 83.9 " +
      "C 123.7 82.8 124.5 81.7 124.8 80.4 C 125.2 79.2 125.3 77.8 125.5 76.5 " +
      "C 125.8 75.3 126.1 74.0 126.4 72.8 C 126.7 71.5 127.0 70.3 127.3 69.0 " +
      "C 127.6 67.8 127.8 66.4 128.2 65.2 C 128.5 63.9 128.8 62.7 129.3 61.4 " +
      "C 129.8 60.3 130.2 59.0 130.9 57.9 C 131.6 56.8 132.4 55.7 133.3 54.7 " +
      "C 134.2 53.8 135.8 52.5 136.3 52.0",
    "models/y/white/app":        Y_JUNIPER_SIDE.cable,
    "models/y-juniper/blue/app": Y_JUNIPER_SIDE.cable,
    "models/y/red/app":
      "M 74.8 93.3 C 75.7 93.1 78.1 92.5 79.8 92.1 C 81.4 91.7 83.1 91.4 84.8 91.0 " +
      "C 86.4 90.7 88.1 90.4 89.8 90.1 C 91.5 89.8 93.1 89.5 94.8 89.2 " +
      "C 96.5 88.9 98.2 88.6 99.8 88.3 C 101.5 88.0 103.2 87.8 104.9 87.4 " +
      "C 106.5 87.1 108.2 86.6 109.8 86.2 C 111.4 85.7 113.1 85.4 114.7 84.8 " +
      "C 116.2 84.2 117.9 83.8 119.1 82.8 C 120.2 81.7 120.9 80.1 121.6 78.6 " +
      "C 122.3 77.2 122.8 75.7 123.2 74.1 C 123.7 72.6 124.0 71.1 124.3 69.5 " +
      "C 124.6 68.0 124.8 66.4 125.2 64.8 C 125.5 63.3 125.9 61.7 126.3 60.2 " +
      "C 126.7 58.7 127.1 57.2 127.7 55.8 C 128.2 54.3 128.7 52.7 129.5 51.4 " +
      "C 130.4 50.0 132.3 48.4 132.8 47.8"
  };

  const PACK_CABLE = {};

  /* Whichever spelling appears in `hay`, give back the canonical folder. */
  function shippedPackDir(hay) {
    const h = String(hay || "");
    for (let i = 0; i < PACKS_SHIPPED.length; i++) {
      if (PACKS_SHIPPED[i].dir && h.indexOf(PACKS_SHIPPED[i].dir) >= 0) return PACKS_SHIPPED[i].dir;
    }
    const qs = Object.keys(PACK_ALIAS);
    for (let i = 0; i < qs.length; i++) if (h.indexOf(qs[i]) >= 0) return PACK_ALIAS[qs[i]];
    return null;
  }

  /* Which body generation a model year implies, or null when the year honestly
     cannot say. There is one such case and it matters: a 2023 Model 3, because
     Highland reached North America in January 2024, so a 2023 build could be
     either car. At module scope because the editor needs the same rule to know
     whether to ask, and two copies of it would drift apart. */
  function genFromYear(model, yr) {
    if (!yr) return null;
    const m = String(model || "").toLowerCase().replace(/\s+/g, "");
    if (m.indexOf("modely") >= 0 || m === "y") return yr >= 2026 ? "juniper" : "classic";
    if (m.indexOf("model3") >= 0 || m === "3") {
      if (yr >= 2024) return "highland";
      if (yr <= 2022) return "classic";
      return null;
    }
    return null;
  }
  /* Position 4 of a Tesla VIN is the model line. It is the one field the
     config duplicates that the car itself can already answer, and a wrong
     value there is quiet but expensive: it picks the image pack, and it feeds
     genFromYear, so "Model Y" on a Model 3 asks for a Juniper decision about a
     Highland car. Buddy sat mislabelled this way until his VIN was read.
     S and X are here for completeness; no pack ships for them yet. */
  const VIN_MODEL = { "3": "Model 3", Y: "Model Y", S: "Model S", X: "Model X" };
  function modelFromVin(vin) {
    const v = String(vin || "").toUpperCase();
    return v.length === 17 ? (VIN_MODEL[v.charAt(3)] || null) : null;
  }
  /* Same normalisation genFromYear uses, so "modely", "Model Y" and "y" all
     compare equal and a cosmetic difference is never reported as a conflict. */
  function sameModel(a, b) {
    const n = (m) => String(m || "").toLowerCase().replace(/\s+/g, "");
    return !!a && !!b && n(a) === n(b);
  }

  function yearFromVin(vin) {
    const v = String(vin || "").toUpperCase();
    return v.length === 17 ? (VIN_YEAR[v.charAt(9)] || null) : null;
  }
  /* The VIN is an attribute on the online binary sensor, which is the cheapest
     place to read it: no entity registry call, and it is there whether the car
     is awake or not. */
  function vinForPrefix(hass, prefix) {
    const p = String(prefix || "");
    const ids = ["binary_sensor." + p + "online"];
    if (p && p.charAt(p.length - 1) !== "_") ids.push("binary_sensor." + p + "_online");
    for (let i = 0; i < ids.length; i++) {
      const st = hass && hass.states && hass.states[ids[i]];
      const v = st && st.attributes && st.attributes.vin;
      if (typeof v === "string" && v.length === 17) return v.toUpperCase();
    }
    return null;
  }

  /* Stable, key-order-independent serialisation. Used only to tell whether a
     config we have been handed differs from the one we already hold: Home
     Assistant may echo the same config back with its keys reordered, so a
     plain JSON.stringify comparison is not reliable. */
  function stableStr(v) {
    if (Array.isArray(v)) return "[" + v.map(stableStr).join(",") + "]";
    if (v && typeof v === "object") {
      return "{" + Object.keys(v).sort().map((k) =>
        JSON.stringify(k) + ":" + stableStr(v[k])).join(",") + "}";
    }
    return JSON.stringify(v === undefined ? null : v);
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  }

  function normIntegration(v) {
    const s = String(v || "").toLowerCase().replace(/[^a-z]/g, "");
    if (s === "teslafleet" || s === "fleet" || s === "teslemetry") return "tesla_fleet";
    if (s === "teslacustom" || s === "custom") return "tesla_custom";
    return "";
  }

  function resolveEntities(car, integration) {
    const p = car.prefix || "";
    const PAT = integration === "tesla_fleet" ? PATTERNS_FLEET : PATTERNS;
    const out = {};
    Object.keys(PAT).forEach((k) => {
      out[k] = (car.entities && car.entities[k]) || (PAT[k] ? PAT[k].replace("{p}", p) : "");
    });
    return out;
  }

  const ICONS = {
    lock: "M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z",
    unlock: "M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h9V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3H7a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1z",
    fan: "M12 11a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m.5-9c4.5 0 4.61 3.57 2.25 4.75-.99.49-1.43 1.54-1.62 2.47.48.2.9.51 1.22.91 5.66-3 9.65.63 9.65 3.37 0 4.5-3.57 4.6-4.75 2.25-.5-1-1.56-1.44-2.49-1.62-.21.48-.52.89-.92 1.21 3.03 5.66-.61 9.66-3.34 9.66-4.5 0-4.61-3.58-2.25-4.76.98-.49 1.42-1.53 1.62-2.45-.49-.2-.92-.52-1.24-.92-5.66 3.02-9.63-.64-9.63-3.37 0-4.5 3.57-4.6 4.75-2.25.49.99 1.53 1.43 2.45 1.62.2-.48.52-.9.92-1.22-3.01-5.65.63-9.65 3.38-9.65z",
    bolt: "M11 15H6l7-14v8h5l-7 14v-8z",
    vent: "M3 5h18v2H3V5m0 4h18v2H3V9m0 4h18v2H3v-2m0 4h18v2H3v-2z",
    refresh: "M17.65 6.35A8 8 0 0 0 12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6 6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
    shield: "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    update: "M13 20h-2V8l-5.5 5.5-1.42-1.42L12 4.16l7.92 7.92-1.42 1.42L13 8v12z",
    chev: "M7.41 8.58 12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z",
    chevR: "M8.59 16.58 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.42z",
    power: "M16.56 5.44l-1.45 1.45A5.97 5.97 0 0 1 18 12a6 6 0 0 1-6 6 6 6 0 0 1-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 5.44A7.96 7.96 0 0 0 4 12a8 8 0 0 0 8 8 8 8 0 0 0 8-8c0-2.72-1.36-5.12-3.44-6.56M13 3h-2v10h2V3z",
    horn: "M12 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h3l5 4V4l-5 4m9.5 4c0 1.71-.96 3.26-2.5 4V8c1.53.75 2.5 2.3 2.5 4z",
    flash: "M9 7c2.8 0 5 2.2 5 5s-2.2 5-5 5c-1.7 0-3-2.2-3-5s1.3-5 3-5m0-2C6 5 4 8.1 4 12s2 7 5 7c3.9 0 7-3.1 7-7s-3.1-7-7-7m8 2h5v2h-5V7m0 4h5v2h-5v-2m0 4h5v2h-5v-2z",
    sentry: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
    pin: "M12 11.5A2.5 2.5 0 0 1 9.5 9 2.5 2.5 0 0 1 12 6.5 2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z",
    sentry: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  };

  /* Mode-button glyphs. Composed from circles, rects and short curves on a
     24x24 grid rather than copied path data, so there is nothing to
     mis-remember. The wrapper sets fill:currentColor; stroked parts override
     it themselves. */
  const CLIM_GLYPH = {
    paw: '<circle cx="6.5" cy="9.6" r="2.1"/><circle cx="10.4" cy="6.6" r="2.1"/>' +
         '<circle cx="14.9" cy="7.1" r="2.1"/><circle cx="18.6" cy="10.9" r="2.1"/>' +
         '<ellipse cx="12.4" cy="16.6" rx="5.3" ry="4.3"/>',
    tent: '<path d="M12 3.2 L2.6 20.4 H9.7 L12 15.2 L14.3 20.4 H21.4 Z"/>',
    defrost: '<rect x="3.5" y="17.2" width="17" height="2.1" rx="1.05"/>' +
             [7, 12, 17].map((x) =>
               `<path d="M ${x} 14.6 q 2.6 -2 0 -4 q -2.6 -2 0 -4" fill="none"` +
               ' stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>').join(""),
  };
  function climIcon(glyph) {
    return `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"` +
           ` style="vertical-align:-3.5px;margin-right:9px;flex:none">${glyph}</svg>`;
  }

  const CLIM_ANCHOR_DEFAULTS = { fl: [121, 164], fr: [233, 164], rl: [123, 289], rc: [176, 289], rr: [229, 289], wheel: [234, 97], vents: [180, 80] };
  /* climate3 is a taller, newly framed top-down image. Its front seats,
     rear seats, and steering wheel sit lower than the older cabin artwork;
     measure these defaults in the shared 360x600 overlay space. */
  const CLIM3_ANCHOR_DEFAULTS = { fl: [121, 280], fr: [233, 280], rl: [123, 414], rc: [176, 414], rr: [229, 414], wheel: [121, 220], vents: [180, 174] };
  function anchor(map, key, def) {
    const v = map && map[key];
    if (!v) return def;
    const p = String(v).split(",").map(Number);
    return (p.length === 2 || p.length === 4) && p.every((n) => !isNaN(n)) ? p : def;
  }

  function svgIcon(path, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24"><path d="' + path + '"/></svg>';
  }

  function heatWaves(id, x, y, sqX = 1, scale = 1) {
    const wave = (off, i) =>
      `<path id="${id}_w${i}" d="M ${x + off} ${y + 13} q 4 -3.3 0 -6.5 q -4 -3.3 0 -6.5 q 4 -3.3 0 -6.5 q -4 -3.3 0 -6.5" stroke="#a9adb2" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return `<g id="${id}" class="tapa" style="cursor:pointer">
      <circle cx="${x}" cy="${y}" r="26" fill="#000" opacity="0"/>
      <g transform="translate(${x}, ${y}) scale(${sqX * scale}, ${scale}) translate(${-x}, ${-y})">
        ${wave(-9, 0)}${wave(0, 1)}${wave(9, 2)}
      </g>
      <text id="${id}_auto" x="${x}" y="${y + 25}" text-anchor="middle" font-size="10.5"
            font-weight="700" fill="${IDLE_COL}" style="display:none">Auto</text>
    </g>`;
  }

  /* Tesla stores a MODE and a LEVEL, not a single number. The app shows this
     as Auto, or Heat / Cool at a level, and setting a level by hand moves the
     car out of Auto into Heat (confirmed against the app on a real car,
     2026-09-02). The old code did `.replace(/^(heat|cool) /, "")` and looked
     the remainder up in a table with `auto: 3`, which threw the mode away.
     That is why a seat on Auto rendered as maximum heat and a COOLED seat
     rendered as a hot one, in red, on cars with ventilated seats. */
  function parseHeat(state) {
    const v = String(state == null ? "" : state).trim().toLowerCase();
    if (!v || v === "off" || v === "unavailable" || v === "unknown")
      return { mode: "off", level: 0 };
    if (v === "auto") return { mode: "auto", level: 0 };
    const mode = v.indexOf("cool") === 0 ? "cool" : "heat";
    const lvl = { low: 1, medium: 2, med: 2, high: 3, on: 3 }[v.replace(/^(heat|cool)\s*/, "")];
    /* a plain switch reports "on" with no level, so treat it as full */
    return { mode, level: lvl === undefined ? 1 : lvl };
  }

  const HEAT_COL = "#e43335", COOL_COL = "#385ec4", IDLE_COL = "#90908e";

  /* -- Defrost glow ----------------------------------------------------------
     Measured off Nick's own app screen recording (ffmpeg, 15fps sampling of a
     4s window), rather than guessed:
       * the REAR screen is a flat vertical gradient - deep at the roofline,
         brightest at the outer edge (redness ramps ~4.4x top to bottom) - and
         is COMPLETELY STATIC: 0.06 variation over 7 seconds.
       * the WINDSCREEN band breathes on a 4.0s cycle at about +/-12%. Only
         that band moves; a control patch of cabin measured 0.09 over the same
         window, so it is the glow, not the view shifting.
       * the vent mist cones are NOT drawn while defrost runs.
       * climate off means defrost off - the app drops both together.
     The climate-view geometry is NOT hand-traced. The recording contains the
     same view with defrost on and off, and the car render is identical between
     them (body patches differ by ~1/255), so differencing the two frames yields
     the glow itself. Connected components separate the two glows (69k and 74k
     px) from the UI text that also changed (~250px each, rejected). That mask
     was warped into pack-image space by matching car bounding boxes, giving the
     outlines and per-row alpha below. Two things it settled: the glows are
     broad soft washes over each END OF THE CABIN, not tight glass polygons, and
     the wing mirrors do NOT tint. Colours are NOT from the recording - that
     phone had a warm colour filter on (its Control Centre is orange too). */
  const DF_ANIM = '<animate attributeName="opacity" dur="4s" repeatCount="indefinite" ' +
    'keyTimes="0;0.155;0.43;0.58;0.72;0.885;1" values=".95;.79;1;.84;.91;.82;.95" ' +
    'calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/>';

  /* Relative alpha measured down each band of the climate view. Both reach zero
     at the inner edge, which is why the app never shows a boundary. */
  const DF_STOPS = {
    ws: [[0, .14], [.08, .98], [.16, .99], [.24, .85], [.32, .75], [.40, .65], [.48, .54],
         [.56, .40], [.64, .35], [.72, .30], [.80, .25], [.88, .17], [.96, .10], [1, 0]],
    rear: [[0, .04], [.09, .10], [.18, .18], [.26, .24], [.34, .35], [.42, .42], [.50, .51],
           [.59, .59], [.67, .68], [.75, .78], [.83, .88], [.91, .97], [1, 1]],
  };
  /* The same two profiles serve every view. A symmetric "fills the pane" curve
     was tried on the top-down and 3/4 renders and was wrong: side by side with
     Nick's screenshot the app's rear-screen tint sits LOW in the pane, hugging
     the shut line and fading upward - exactly the measured rear profile. */

  /* Peaks and colour. clim_* are the video-measured view and are left alone.
     The pane_* set is used on the views with no reference; its colour is more
     saturated because a composite match against the reference screenshot showed
     the old one going muddy: brightest pixels measured RGB 155/67/52 against the
     app's 108/39/31 - brighter in red but far greyer, which reads as dark. */
  /* Radial falloff for the 3/4 rear renders. Reaching zero at the shape's edge
     means the tint physically cannot appear outside its outline. */
  const DF_BLOB = [[0, 1], [.45, .97], [.62, .90], [.75, .72], [.86, .47], [.94, .22], [1, 0]];
  const DF_PEAK = { ws: 0.36, rear: 0.66, pane_ws: 0.42, pane_rear: 0.78, blob: 0.68 };
  const DF_COLOR = { ws: "#c0341f", rear: "#cb3a22", pane: "#c33019" };

  function dfScale(stops, peak, lo, hi) {
    return stops.map((st) => [lo + st[0] * (hi - lo), st[1] * peak]);
  }
  function dfGradStops(r) {
    const W = DF_STOPS.ws, R = DF_STOPS.rear, P = DF_PEAK;
    if (r.g === "blob") return { radial: 1, stops: dfScale(DF_BLOB, P.blob, 0, 1), colour: DF_COLOR.pane };
    if (r.g === "ws" || r.g === "rear") {
      const base = r.g === "ws" ? W : R;
      const peak = r.pane ? P["pane_" + r.g] : P[r.g];
      return { stops: dfScale(base, peak, 0, 1), colour: r.pane ? DF_COLOR.pane : DF_COLOR[r.g] };
    }
    /* only reached if a caller invents a recipe name; the drawn-art one went
       when the drawn art did */
    return { stops: dfScale(R, P.rear, 0, 1), colour: DF_COLOR.rear };
  }

  /* Outlines. clim_* came out of the video by differencing a defrost-on frame
     against a defrost-off one. top_* were measured off the pack photo: per-row
     glass-edge detection on the left flank, median-smoothed and mirrored about
     the car centreline (the right flank is shadowed and defeats the detector),
     inset 2 units. pane_* were traced and checked by drawing them back over the
     photos. All of them are verifiable by re-rendering, not by taste. */
  const DF_PATHS = {
    clim_ws: "M 133.5 12.5 L 104 20.5 L 90 28.5 L 88.5 36.5 L 88.5 44.5 L 89 52.5 L 89.5 60.5 L 90.5 68.5 L 91 76.5 L 92 84.5 L 92.5 92.5 L 94 100.5 L 100.5 108.5 L 103 110.5 L 267 110.5 L 274.5 108.5 L 276.5 100.5 L 277.5 92.5 L 278 84.5 L 279 76.5 L 280 68.5 L 280 60.5 L 281 52.5 L 281.5 44.5 L 281.5 36.5 L 280 28.5 L 266 20.5 L 236 12.5 Z",
    clim_rear: "M 110.5 323.5 L 107.5 331.5 L 107.5 339.5 L 108 347.5 L 108.5 355.5 L 109.5 363.5 L 110 371.5 L 111 379.5 L 112 387.5 L 112.5 395.5 L 113.5 403.5 L 114.5 411.5 L 115.5 419.5 L 117 427.5 L 119.5 435.5 L 125 443.5 L 141.5 451.5 L 172.5 456 L 198 456 L 228.5 451.5 L 245.5 443.5 L 250.5 435.5 L 253 427.5 L 254.5 419.5 L 255.5 411.5 L 256.5 403.5 L 257.5 395.5 L 258 387.5 L 259 379.5 L 260 371.5 L 260.5 363.5 L 261.5 355.5 L 262.5 347.5 L 262.5 339.5 L 263 331.5 L 255.5 323.5 Z",
    /* the top-down has three glass panels; shut lines measured at vb 183, 332 and 603,
       so the windscreen ends at 331 and the rear screen does not start until 604 */
    top_ws: "M 99 176 L 88 240 L 91 305 L 93 330 L 267 330 L 269 305 L 272 240 L 261 176 Z",
    top_rear: "M 108 606 L 110 642 L 123 706 L 146 728 L 214 728 L 237 706 L 250 642 L 252 606 Z",
    /* bottom edge follows the decklid shut line, which rises toward the tail;
       alpha peaks there, so an overhang onto bodywork shows immediately */
    /* NOT a pane outline: this is the app's own glow region, segmented out of
       Nick's Model 3 screenshot and mapped here by matching car bounding boxes.
       The app keeps clear margin inside the rear window on every side, so the
       tint never touches the roofline, C-pillar or decklid. */
    pane_plugged: "M 159.6 22.6 L 157.8 23.6 L 149.7 24.5 L 144.4 25.5 L 141.9 26.5 L 138.7 27.5 L 138.7 28.5 L 139.8 29.5 L 140.9 30.4 L 141.9 31.4 L 142.6 32.4 L 144.4 33.4 L 145.4 34.4 L 148.3 35.3 L 150.7 36.3 L 151.8 37.3 L 161.7 37.3 L 165.2 36.3 L 174 35.3 L 179 34.4 L 181.1 33.4 L 182.9 32.4 L 183.6 31.4 L 183.6 30.4 L 182.9 29.5 L 180.4 28.5 L 179 27.5 L 179 26.5 L 178.6 25.5 L 175.8 24.5 L 173.3 23.6 L 171.9 22.6 Z",
    pane_charging: "M 159.6 23.6 L 158.2 24.5 L 149.7 25.3 L 144 26.2 L 141.9 27.1 L 138.7 27.9 L 138.7 28.8 L 140.2 29.7 L 140.9 30.5 L 141.9 31.4 L 143 32.3 L 144.7 33.1 L 146.5 34 L 148.6 34.8 L 151.1 35.7 L 152.9 36.6 L 155.3 36.6 L 165.2 35.7 L 174 34.8 L 176.9 34 L 181.1 33.1 L 182.9 32.3 L 183.9 31.4 L 183.9 30.5 L 183.2 29.7 L 180.8 28.8 L 179.3 27.9 L 179.3 27.1 L 179.3 26.2 L 176.2 25.3 L 173.7 24.5 L 172.3 23.6 Z"
  };

  /* anim marks the piece that breathes: only the climate view's front wash,
     the one region the recording showed moving (its top, middle and lower
     thirds all varied ~22-24%, i.e. the group as a whole). fade adds the
     horizontal mask that stops a shape's sides from showing. */
  const DF_REGIONS = {
    Clim: [{ k: "ws", g: "ws", d: "clim_ws", anim: 1 }, { k: "re", g: "rear", d: "clim_rear" }],
    Top: [{ k: "ws", g: "ws", pane: 1, d: "top_ws", fade: 1 },
          { k: "re", g: "rear", pane: 1, d: "top_rear", fade: 1 }],
    /* side.jpg is shot from the front: no rear screen in frame, and the app
       showed no tint on the home view at all (it measured flat). So: none. */
    Rest: [],
    RestPlugged: [{ k: "re", g: "blob", d: "pane_plugged" }],
    RestCharging: [{ k: "re", g: "blob", d: "pane_charging" }],
    Art: []
  };

  /* --- Fitting the outlines to whatever pack is actually on screen ---------
     Every outline below was traced against the bundled pack's photos. A
     different pack frames the car differently - Patsy's Model Y climate render
     is 14% wider and 11% taller than the bundled Model 3 one and sits shifted -
     so the same coordinates land small and high on it, which is exactly how
     this was found. DF_CALIB records the car's bounding box in the image each
     view was traced against; at render time the card measures the car box in
     the image actually being shown and maps the outline across. Detection is a
     one-off canvas read per image URL, cached, and falls back to these numbers
     if it can't run (tainted canvas, load failure). */
  /* each view's overlay viewBox, needed to express a measured box in view units */
  const DF_VB = { Clim: [360, 600], Top: [360, 773], Rest: [233, 108],
                  RestPlugged: [233, 108], RestCharging: [233, 108] };
  const DF_CALIB = {
    Clim: [26.5, 10.5, 334, 514],          // images/models/3/grey/app/climate.jpg
    Top: [24, 14.5, 336, 754],             // …/topdown.jpg
    Rest: [33.9, 7.5, 205.5, 105.1],       // …/side.jpg
    RestPlugged: [33.9, 7.5, 205.5, 105.1],
    RestCharging: [33.9, 10.7, 205.8, 96.2]
  };
  /* remap every coordinate pair in an "M x y L x y … Z" path from the box it
     was traced in to the box measured on screen */
  function dfFit(d, from, to) {
    if (!from || !to) return d;
    const sx = (to[2] - to[0]) / (from[2] - from[0]);
    const sy = (to[3] - to[1]) / (from[3] - from[1]);
    if (!isFinite(sx) || !isFinite(sy) || sx <= 0 || sy <= 0) return d;
    let n = 0;
    return d.replace(/-?\d*\.?\d+/g, (v) => {
      const f = parseFloat(v);
      const out = (n++ % 2 === 0) ? to[0] + (f - from[0]) * sx
                                  : to[1] + (f - from[1]) * sy;
      return String(Math.round(out * 10) / 10);
    });
  }

  function dfStopTags(stops, colour) {
    return stops.map((st) => `<stop offset="${+st[0].toFixed(3)}" stop-color="${colour}" ` +
      `stop-opacity="${+st[1].toFixed(3)}"/>`).join("");
  }
  function dfDefs(sfx, car, override) {
    return dfRegions(sfx, car, override).map((r) => {
      const G = dfGradStops(r);
      let out = G.radial
        ? `<radialGradient id="dfG_${r.k}${sfx}" cx=".5" cy=".5" r=".5">` +
          `${dfStopTags(G.stops, G.colour)}</radialGradient>`
        : `<linearGradient id="dfG_${r.k}${sfx}" x1="0" y1="0" x2="0" y2="1">` +
          `${dfStopTags(G.stops, G.colour)}</linearGradient>`;
      if (r.fade) out +=
        `<linearGradient id="dfF_${r.k}${sfx}" x1="0" y1="0" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#000"/><stop offset=".22" stop-color="#fff"/>` +
        `<stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
        `<mask id="dfM_${r.k}${sfx}" maskContentUnits="objectBoundingBox">` +
        `<rect x="0" y="0" width="1" height="1" fill="url(#dfF_${r.k}${sfx})"/></mask>`;
      return out;
    }).join("");
  }
  function dfRegions(sfx, car, override) {
    if (override) return override;
    const base = DF_REGIONS[sfx] || [];
    const o = (car && car.defrost_glass) || {};
    const own = o[sfx.toLowerCase()];
    if (!own) return base;
    /* per-car override: swaps the outlines for this view, keeping the recipes */
    return String(own).split("|").map((d) => d.trim()).filter(Boolean).map((d, i) => {
      const b = base[i] || base[0] || { k: "re", g: "rear", pane: 1, fade: 1 };
      return { k: b.k || ("o" + i), g: b.g, pane: b.pane, anim: b.anim, fade: b.fade, raw: d };
    });
  }
  function dfGlow(sfx, car, override, box) {
    const regions = dfRegions(sfx, car, override);
    if (!regions.length) return "";
    const body = regions.map((r) => {
      let d = r.raw || DF_PATHS[r.d];
      if (!d) return "";
      d = dfFit(d, DF_CALIB[sfx], box);
      const shape = `<path d="${d}" fill="url(#dfG_${r.k}${sfx})"/>`;
      const mask = r.fade ? ` mask="url(#dfM_${r.k}${sfx})"` : "";
      return `<g${mask}>${shape}${r.anim ? DF_ANIM : ""}</g>`;
    }).join("");
    return `<g id="df${sfx}" style="display:none" pointer-events="none">${body}</g>`;
  }

  function relDur(iso) {
    if (!iso) return "";
    const t = new Date(iso).getTime();
    if (isNaN(t)) return "";
    const m = Math.floor(Math.max(0, Date.now() - t) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + (m === 1 ? " minute" : " minutes");
    const h = Math.floor(m / 60);
    if (h < 48) return h + (h === 1 ? " hour" : " hours");
    return Math.floor(h / 24) + " days";
  }

  ICONS.plug = "M16 7V3h-2v4h-4V3H8v4c-1.1 0-2 .9-2 2v5.5L9.5 18v3h5v-3l3.5-3.5V9c0-1.1-.9-2-2-2z";

  class TeslaFleetCard extends HTMLElement {
    static getConfigElement() {
      return document.createElement("tesla-fleet-card-editor");
    }
    static getStubConfig() {
      return { cars: [{ name: "My Tesla", model: PACK_DEFAULT.model,
                        paint: PACK_DEFAULT.paint, prefix: "" }] };
    }

    setConfig(config) {
      if (!config || !Array.isArray(config.cars) || !config.cars.length) {
        if (config && (config.prefix !== undefined || config.entities || config.name)) {
          config = { cars: [config] };
        } else {
          throw new Error("tesla-fleet-card: define at least one car under 'cars:'");
        }
      }
      this._config = Object.assign({}, CARD_DEFAULTS, config);
      this._cars = this._config.cars.map((c) => {
        const car = Object.assign({}, CAR_DEFAULTS, c);
        /* `color` was removed as a config option: it only ever tinted the drawn
           fallback art, which `paint` already does. Drop any left over from an
           older config so no dead key survives on the car object. */
        delete car.color;
        car._cableSet = c.cable !== undefined;
        const forced = normIntegration(car.integration);
        car._integration = forced || "";           // "" = auto-detect at first hass
        car._entities = resolveEntities(car, forced || "tesla_custom");
        car._detected = !!forced;
        return car;
      });
      /* Keep the chosen car across setConfig. Three sources, in order: this
         instance (a dashboard card that is merely being re-fed its config),
         then the module-scope memory (a preview element HA has just rebuilt
         under us), then default_car for a genuinely first render. */
      this._selKey = selKey(this._config.cars);
      const keep = typeof this._sel === "number" && this._sel < this._cars.length;
      const remembered = LAST_SEL.get(this._selKey);
      this._sel = keep ? this._sel
                : (typeof remembered === "number" && remembered < this._cars.length)
                  ? remembered
                  : Math.min(this._config.default_car || 0, this._cars.length - 1);
      this._built = false;
      this._arm = {};
      this._armT = {};
      this._openRows = {};
      this._view = this._view || "";
    }

    getCardSize() { return 10; }

    connectedCallback() {
      this._timer = setInterval(() => { if (this._hass) this._update(); }, 30000);
      if (typeof ResizeObserver !== "undefined") {
        this._resizeObserver = new ResizeObserver(() => {
          if (this._resizeFrame) cancelAnimationFrame(this._resizeFrame);
          this._resizeFrame = requestAnimationFrame(() => {
            this._driveTier = null;
            this._positionClimateLayout();
            this._updateClimateCable();
            if (this._hass) this._update();
          });
        });
        this._resizeObserver.observe(this);
      }
    }
    disconnectedCallback() {
      if (this._resizeObserver) this._resizeObserver.disconnect();
      if (this._resizeFrame) cancelAnimationFrame(this._resizeFrame);
      clearInterval(this._timer);
      clearTimeout(this._refT1);
      clearTimeout(this._refT2);
      if (this._climateCableFrame) cancelAnimationFrame(this._climateCableFrame);
      this._climateCableFrame = null;
      clearTimeout(this._flashTimer);
      clearTimeout(this._hornTimer);
      clearTimeout(this._climateDriveTimer);
      this._climateDriveTimer = null;
      this._queuedClimateView = undefined;
      if (this._climateTransitionTarget) {
        this._climateTransitionToken = (this._climateTransitionToken || 0) + 1;
        this._climateTransitionTarget = null;
        if (this.shadowRoot) {
          this.shadowRoot.querySelectorAll(".transitionSnapshot, .snapLayer").forEach((el) => el.remove());
          this.shadowRoot.querySelectorAll(".transitionFadeLive, .transitionSourceHidden").forEach((el) => el.classList.remove("transitionFadeLive", "transitionSourceHidden"));
          const card = this.shadowRoot.querySelector("ha-card");
          if (card) {
            card.style.overflow = "";
            if (this._view === "clim" && this._climateMainHeight) {
              const stableHeight = String(this._climateMainHeight) + "px";
              card.style.height = stableHeight;
              card.style.minHeight = stableHeight;
            } else {
              card.style.height = "";
              card.style.minHeight = "";
              this._climateMainHeight = null;
            }
          }
        }
      }
    }
    get _car() { return this._cars[this._sel]; }

    set hass(hass) {
      this._hass = hass;
      if (!this._config) return;
      this._cars.forEach((car) => {
        if (car._detected) return;
        const raw = car.prefix || "";
        /* Leaving the trailing underscore off the prefix is the most common
           setup mistake there is (issue #1: "grande_bianco" for entities named
           grande_bianco_*). The README says to include it and the on-card
           diagnostic says so too, and people still trip over it, so try the
           corrected form as well and adopt it silently if that is what
           matches. Only the in-memory car is touched, never the saved config. */
        const tries = raw && !/_$/.test(raw) ? [raw, raw + "_"] : [raw];
        for (let t = 0; t < tries.length; t++) {
          const p = tries[t];
          let integ = "";
          if (hass.states["sensor." + p + "battery"]) integ = "tesla_custom";
          else if (hass.states["sensor." + p + "battery_level"]) integ = "tesla_fleet";
          if (integ) {
            car.prefix = p;
            car._integration = integ;
            car._entities = resolveEntities(car, integ);
            car._detected = true;
            if (car === this._car) this._built = false;   // rebuild with the right entities
            break;
          }
        }
      });
      this._cars.forEach((car) => this._probeImages(car));
      if (!this._built) this._build();
      this._update();
    }

    /* A full rebuild wipes the shadow DOM, snapshots included. Async work
       (image box measuring, pack probing, plug state) used to land mid-
       transition and kill the animation, which is why the FIRST climate
       click after a page load never animated. Defer until it finishes. */
    _rebuildSoon() {
      if (this._climateDriveTimer || this._climateTransitionTarget) { this._pendingRebuild = true; return; }
      this._built = false;
      if (this._hass) { this._build(); this._update(); }
    }
    _flushRebuild() {
      if (this._pendingRebuild) { this._pendingRebuild = false; this._rebuildSoon(); }
    }
    _drainQueuedClimateView() {
      const queued = this._queuedClimateView;
      if (queued === undefined) return;
      this._queuedClimateView = undefined;
      if (queued === this._view) return;
      requestAnimationFrame(() => {
        if (queued !== this._view) this._setView(queued);
      });
    }

    _selectCar(i) {
      if (i === this._sel) return;
      this._sel = i;
      rememberSel(this._selKey, i);
      this._view = "";
      this._built = false;
      this._arm = {};
      this._lastPlugged = undefined;
      this._build();
      this._update();
    }

    /* THE one place every reading goes through, so the preview patch applied
       here reaches the whole card consistently: cable, glow, road, wheels,
       status line, rows. Patching individual getters instead would leave the
       overlays disagreeing with each other. */
    _st(key) {
      const id = this._car._entities[key];
      let s = (id && this._hass && this._hass.states[id]) || null;
      if (s && HOLD_KEYS[key]) s = this._hold(id, s);
      const patch = this._preview && PREVIEW_PATCH[this._preview];
      const p = patch && patch[key];
      if (!p) return s;
      const base = s || { entity_id: id || ("binary_sensor." + key), attributes: {} };
      const out = { entity_id: base.entity_id, state: base.state,
                    attributes: Object.assign({}, base.attributes || {}) };
      if ("state" in p) out.state = p.state;
      if (p.attributes) Object.assign(out.attributes, p.attributes);
      return out;
    }
    /* Remember each held entity's last real state, and stand it in for
       "unavailable" / "unknown" while it is recent enough to trust. */
    _hold(id, s) {
      this._lastGood = this._lastGood || {};
      if (s.state !== "unavailable" && s.state !== "unknown") {
        this._lastGood[id] = { s: s, ts: Date.now() };
        return s;
      }
      const g = this._lastGood[id];
      return g && Date.now() - g.ts < HOLD_MS ? g.s : s;
    }
    _num(key) {
      const s = this._st(key);
      const v = s ? parseFloat(s.state) : NaN;
      return isNaN(v) ? null : v;
    }
    _is(key, val) {
      /* Optimistic lock: ignore HA for a few seconds after a command is sent */
      if (this._opt && this._opt[key] && Date.now() < this._opt[key].expires) {
        return this._opt[key].state === val;
      }
      const s = this._st(key);
      /* Skip "unavailable" — Tesla goes unavailable during wake-up. Fall back
         to the last known good state so the image doesn't flash to "closed"
         in the middle of an open sequence. */
      if (s && s.state === "unavailable") {
        const last = this._lastKnown && this._lastKnown[key];
        return last !== undefined ? last === val : false;
      }
      if (s) {
        if (!this._lastKnown) this._lastKnown = {};
        this._lastKnown[key] = s.state;
      }
      return !!s && s.state === val;
    }
    /* integration-agnostic helpers */
    _charging() {
      const s = this._st("charging");
      if (!s) return false;
      if (s.entity_id.startsWith("binary_sensor.")) return s.state === "on";
      return String(s.state).toLowerCase() === "charging";   // tesla_fleet sensor
    }
    _plugged() { return this._is("charger", "on"); }
    _visualPlugged() { return this._car.force_plugged === true || this._plugged(); }
    _visualFrunkOpen() { return this._car.force_frunk_open === true || this._is("frunk", "open"); }
    _visualTrunkOpen() { return this._car.force_trunk_open === true || this._is("trunk", "open"); }
    /* Defrost is a real switch on tesla_fleet; on tesla_custom it is a climate
       preset. Single source of truth for the button, the glass glow and the
       header badge. */
    /* --- Optimistic state -------------------------------------------------
       Tesla polls, so a command can take a minute to show up in HA. Without
       this the card looks broken: you press Defrost, the car starts heating,
       and nothing on screen moves. So: assume the command worked, show that
       immediately, and let the real state take over the moment it agrees (or
       time out and fall back to the truth if it never does). */
    _setPend(key, val) {
      this._pend = this._pend || {};
      this._pend[key] = { val: val, ts: Date.now() };
      this._nudgeRefresh();
      if (this._hass) this._update();
    }
    _pendVal(key) {
      const p = this._pend && this._pend[key];
      if (!p) return undefined;
      if (Date.now() - p.ts > PEND_MS) { delete this._pend[key]; return undefined; }
      return p.val;
    }
    /* Ask the car for fresh data shortly after a command instead of waiting for
       the next poll. Only ever after a command - never on a timer, because this
       wakes the car and spends API calls. */
    _nudgeRefresh() {
      const id = this._car && this._car._entities && this._car._entities.refresh;
      if (!id || !this._hass) return;
      clearTimeout(this._refT1); clearTimeout(this._refT2);
      this._refT1 = setTimeout(() => this._call("button", "press", { entity_id: id }), 4000);
      this._refT2 = setTimeout(() => this._call("button", "press", { entity_id: id }), 11000);
    }

    /* Measure the car's bounding box in an image, once per URL. Same-origin
       (/local/, /hacsfiles/) reads fine; raw.githubusercontent.com sends
       access-control-allow-origin:*, so crossOrigin="anonymous" works there
       too. Anything else falls back to the traced calibration. */
    /* The VIN, from whichever of the car's own entities carries it. Not from
       the entity registry: tesla_custom puts it straight on the attributes of
       binary_sensor.<car>_online, so it costs nothing to read and needs no
       websocket call. Every entity is scanned rather than one hardcoded, so a
       different integration exposing it elsewhere still works. */
    /* Every one of these takes an OPTIONAL car and defaults to the selected
       one. That is not tidiness: _probeImages runs over EVERY car in the
       config, so a helper that silently reads this._car judges five cars by
       the sixth. That bug shipped in v1.1.6 and made the generation refusal do
       nothing on a multi-car card, which is every real card. */
    _vin(carArg) {
      const car = carArg || this._car;
      if (car.vin) return String(car.vin).toUpperCase();
      if (car._vin !== undefined) return car._vin;
      car._vin = null;
      const ents = car._entities || {};
      const keys = Object.keys(ents);
      for (let i = 0; i < keys.length; i++) {
        const st = this._hass && this._hass.states && this._hass.states[ents[keys[i]]];
        const v = st && st.attributes && st.attributes.vin;
        if (typeof v === "string" && v.length === 17) { car._vin = v.toUpperCase(); break; }
      }
      return car._vin;
    }
    /* Which body generation this car is, for picking a pack. From config if
       given, otherwise from the VIN's model year, and ONLY where that mapping
       is unambiguous.

       Model Y is clean: Tesla brands the 2025-built Juniper as a 2026 model, so
       VIN position 10 of T or later is Juniper and S or earlier is pre-refresh.
       Model 3 is not: Highland reached North America in January 2024, so 2024
       and later is Highland and 2022 and earlier is not, but a 2023 could be
       either and this returns null rather than guessing. A null simply means
       "no generation preference", which is the behaviour that existed before. */
    _generation(carArg) {
      const car = carArg || this._car;
      const cfg = String(car.generation || car.gen || "").toLowerCase();
      if (cfg) return cfg;
      return genFromYear(car.model, this._year(car));
    }
    /* the generation of the pack actually on screen, where we know it */
    _packGen() {
      const dir = String(this._car.images || this._car._autoBase || "");
      if (!dir) return null;
      const canon = shippedPackDir(dir);
      return canon ? (SHIPPED_GEN[canon] || null) : null;
    }
    /* "your car is a Juniper but these are pre-refresh photos", or null */
    _genMismatch() {
      const want = this._generation(), got = this._packGen();
      if (!want || !got || want === got) return null;
      return { want: GEN_LABEL[want] || want, got: GEN_LABEL[got] || got };
    }
    _year(carArg) {
      return yearFromVin(this._vin(carArg));
    }
    /* Which bundled pack is on screen. This used to look only at `images`
       and the auto-detected base, and so missed every car configured with
       the individual image_side / image_charging keys instead of a single
       `images` directory - which is how Patsy is set up. The result was
       that the Model Y cars matched no pack, got no wheels, and had their
       road line pushed off the bottom of the frame, so Nick saw the whole
       animation only on the Model 3s. The URL of the photo being displayed
       is the reliable place to look, because it is the thing that actually
       decides which car is on screen. */
    _packKey(src) {
      const hay = String(this._car.images || "") + " " +
                  String(this._car._autoBase || "") + " " + String(src || "");
      const direct = Object.keys(PACK_WHEELS).filter((k) => hay.indexOf(k) >= 0)[0];
      if (direct) return direct;
      /* a generation-qualified spelling of the same photo set */
      const canon = shippedPackDir(hay);
      return canon && PACK_WHEELS[canon] ? canon : null;
    }
    /* Wheel ellipses for the photo we are showing. Only the bundled packs
       were measured, and a wrong ellipse is a visible wobble, so somebody
       else's photo gets still wheels rather than a guess. */
    _wheels(src) {
      if (String(this._car.drive_motion || "auto").toLowerCase() === "off") return null;
      const cfg = this._car.wheels;
      if (cfg && cfg.front && cfg.rear) return cfg;
      const hit = this._packKey(src);
      if (hit) return PACK_WHEELS[hit];
      const model = String(this._car.model || "").toLowerCase().replace(/\s+/g, "");
      const paint = String(this._car.paint || "").toLowerCase();
      if ((model === "y" || model.indexOf("modely") >= 0) && paint.indexOf("white") >= 0) return PACK_WHEELS["models/y/white/app"];
      return null;
    }
    /* The ground plane for the photo we are actually showing.
       drive_motion: off suppresses the moving road altogether. */
    _road(src) {
      if (String(this._car.drive_motion || "auto").toLowerCase() === "off") return null;
      const cfg = this._car.road;
      if (cfg && typeof cfg === "object" && cfg.lines) return cfg;
      const hit = this._packKey(src);
      return hit ? PACK_ROAD[hit] : ROAD_DEFAULT;
    }
    /* Speed in km/h whatever the car displays, for choosing the animation
       tier. Kept apart from _speed(), which formats it for the eye. */
    /* km/h whatever the car displays, so the tier threshold is a real speed
       rather than 20 of whichever unit happens to be configured.

       Returns 0 for a car that is genuinely stopped and null only when the
       speed is not available at all. The difference matters: a stopped car
       freezes the animation, a car whose speed we cannot read falls back to
       moving, because guessing "stopped" would strand the road mid-slide on
       any integration that does not report speed. */
    _speedKph() {
      const t = this._st("location");
      const at = t && t.attributes;
      const raw = at && ("speed" in at) ? at.speed : undefined;
      /* tesla_custom reports speed as NULL on a parked car, not 0, checked on
         Emmanuel the moment he parked. So a null that is present means "not
         moving"; only a missing key means "this integration does not tell us",
         and that falls back to animating rather than freezing. */
      if (raw === undefined) return null;
      if (raw === null || raw === "") return 0;
      const v = Number(raw);
      if (!isFinite(v) || v < 0) return 0;
      return this._imperial() ? v * 1.609344 : v;
    }
    _carBox(url, sfx) {
      if (!url) return DF_CALIB[sfx];
      this._boxes = this._boxes || {};
      if (this._boxes[url]) return this._boxes[url];
      this._measureBox(url, sfx);
      return DF_CALIB[sfx];
    }
    _measureBox(url, sfx) {
      this._boxTried = this._boxTried || {};
      if (this._boxTried[url]) return;
      this._boxTried[url] = true;
      const vb = DF_VB[sfx] || [360, 600];
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const cv = document.createElement("canvas");
          const W = cv.width = img.naturalWidth, H = cv.height = img.naturalHeight;
          if (!W || !H) throw new Error("no size");
          const ctx = cv.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          const px = ctx.getImageData(0, 0, W, H).data;
          let x0 = W, y0 = H, x1 = -1, y1 = -1;
          for (let y = 0; y < H; y++) {
            const row = y * W * 4;
            for (let x = 0; x < W; x++) {
              const i = row + x * 4;
              /* rec.601 luma; the renders sit on a near-black ground */
              if (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2] > 45) {
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
              }
            }
          }
          if (x1 <= x0 || y1 <= y0) throw new Error("nothing found");
          this._boxes[url] = [x0 * vb[0] / W, y0 * vb[1] / H, x1 * vb[0] / W, y1 * vb[1] / H];
          this._rebuildSoon();
        } catch (e) {
          this._boxes[url] = DF_CALIB[sfx];      // tainted canvas or odd image
        }
      };
      img.onerror = () => { this._boxes[url] = DF_CALIB[sfx]; };
      img.src = url;
    }

    _defrostOn() {
      const want = this._pendVal("defrost");
      const real = this._defrostReal();
      if (want === undefined) return real;
      if (real === want) { delete this._pend.defrost; return real; }   // confirmed
      return want;                                                     // still in flight
    }
    _defrostReal() {
      const ds = this._st("defrost_switch");
      if (ds) return ds.state === "on";
      const cs = this._st("climate");
      /* tesla_custom leaves preset_mode on "defrost" after the HVAC is switched
         off, which left the glass lit with the climate off. The app drops both
         together, so treat an off/unknown climate as defrost off. Note this is
         only correct at steady state: for the first poll cycle after you press
         Defrost the climate still reads "off" while preset is already
         "defrost", which is exactly what _pendVal covers. */
      if (!cs || cs.state === "off" || cs.state === "unavailable" || cs.state === "unknown") return false;
      return cs.attributes.preset_mode === "defrost";
    }

    /* prefer the level select, fall back to the plain switch */
    /* mph off the tracker, shown in the unit the range sensor uses */
    _speed() {
      const t = this._st("location");
      const raw = t && t.attributes ? t.attributes.speed : null;
      if (raw === null || raw === undefined || raw === "") return null;
      return this._speedFrom(raw);
    }
    /* MEASURED, not assumed. This used to treat the value as mph and convert
       it, on the reasoning that Tesla's API reports mph regardless of the
       car's own units. That was wrong, and it was flagged at the time as the
       one number here nobody had watched a car produce.

       Settled with the odometer, which is the honest instrument: Emmanuel
       covered 1.40013 km in exactly 180 seconds, a true average of 28.0 km/h,
       while the speed field read 40 falling to 22 over the same window and
       Nick, reading the car, called out numbers averaging 30.3. Had the field
       been mph the true speed would have been about 50 km/h, so that is out by
       a factor of 1.8.

       The field follows the CAR'S DISPLAY UNITS, which is also what the range
       sensor does, so labelling it with the range sensor's unit and doing no
       arithmetic is right in both metric and imperial installs. */
    _speedFrom(raw) {
      const v = Number(raw);
      if (!isFinite(v) || v <= 0) return null;
      return Math.round(v) + (this._imperial() ? " mph" : " km/h");
    }
    _imperial() {
      return String(this._unit("range", "km")).toLowerCase().indexOf("mi") === 0;
    }
    _steerEnt() { return this._st("steering_heat_sel") || this._st("steering_heat"); }
    _steeringOn() {
      const s = this._steerEnt();
      if (!s) return false;
      return parseHeat(s.state).mode !== "off";
    }
    _minsToFull() {
      const s = this._st("charge_complete");
      if (!s) return NaN;
      const attrMin = s.attributes ? parseFloat(s.attributes.minutes_to_full_charge) : NaN;
      if (!isNaN(attrMin)) return attrMin;                    // tesla_custom

      // check if it's an ISO timestamp (teslemetry / new tesla_fleet)
      const t = new Date(s.state).getTime();
      if (!isNaN(t) && t > 1000000000000) { // arbitrary year 2001+ to avoid tiny numbers parsing as years
        return Math.max(0, (t - Date.now()) / 60000);
      }

      const v = parseFloat(s.state);
      if (isNaN(v)) return NaN;
      const u = (s.attributes.unit_of_measurement || "").toLowerCase();
      if (u.indexOf("min") === 0) return v;
      return v * 60;                                          // legacy tesla_fleet reported hours
    }
    /* Image resolution: explicit per-car image_* options win; otherwise an
       `images:` base folder (or the auto-detected HACS images folder) supplies
       the standard filenames; otherwise "" and the built-in artwork draws. */
    _imgBase() {
      const car = this._car;
      return car.images || car._autoBase || "";
    }
    _preferPng(url) {
      return typeof url === "string"
        ? url.replace(/\.jpe?g(?=([?#]|$))/i, ".png")
        : url;
    }
    _img(kind) {
      const car = this._car;
      if (car[kind]) return this._preferPng(car[kind]);
      const base = this._imgBase();
      if (!base) return "";
      const FILES = {
        image: "topdown.jpg", image_top_plugged: "topdown-plugged.jpg",
        image_top_charging: "topdown-charging.jpg", image_side: "side.jpg",
        image_side_plugged: "side-plugged.jpg", image_charging: "side-charging.jpg",
        image_climate: "climate.jpg",
      };
      let f = FILES[kind];
      if (kind === "image_climate" && !car.image_climate) {
        if (car._packFiles) {
          if (car._packFiles["climate3.jpg"]) f = "climate3.jpg";
        } else if (car.images) f = "climate3.jpg";
      }
      /* A lean pack has no cable variants at all, so a request for one resolves
         to the base render and the card draws the cable over it. Without this a
         configured `images:` base would return a URL for a file that is not
         there, which renders as a broken image rather than a car. */
      /* ONLY the top-down. The side view cannot take a drawn cable: the app
         swings to a rear three-quarter only when a cable is attached, so no
         render exists of that angle with the charge port open and no cable.
         Nick spotted it from the port flap: "the bit on the side of the car
         that opens exists and doesnt exist". Falling back side-charging to
         side-plugged would show the charging state with a baked BLUE cable. */
      const LEAN_FALLBACK = { image_top_plugged: "image", image_top_charging: "image" };
      if (this._packCable() && LEAN_FALLBACK[kind]) return this._img(LEAN_FALLBACK[kind]);
      // Auto-detected packs may be partial: only offer files that actually exist,
      // so missing slots fall back to the drawn artwork instead of a broken img.
      // If side images are missing, fall back to the climate image we know exists.
      if (!car.images && car._packFiles && !car._packFiles[f]) {
        const sideKinds = ["image_side", "image_side_plugged", "image_charging"];
        if (sideKinds.includes(kind)) {
          return this._preferPng(base.replace(/\/$/, "") + "/climate.jpg");
        }
        return "";
      }
      return this._preferPng(base.replace(/\/$/, "") + "/" + f + "?v=1");
    }
    /* The cable spec for the pack on screen, when it declares one. */
    /* The dash path for a baked photo: the car's own override first, then the
       pack it came from. No match means no trace exists for that photo, and
       drawing a guessed curve over someone's car is worse than drawing none. */
    _packClimPort() {
      const car = this._car;
      const hay = String(car.images || car._autoBase || car.image_climate || "");
      const canon = hay ? shippedPackDir(hay) : null;
      return (canon && PACK_CLIM_PORT[canon]) || null;
    }
    _bakedCablePath() {
      const car = this._car;
      if (car.cable_points && Array.isArray(car.cable_points) && car.cable_points.length >= 2) {
        const p = car.cable_points;
        let d = `M ${p[0][0]} ${p[0][1]} `;
        for (let i = 1; i < p.length - 1; i++) {
          const xc = (p[i][0] + p[i + 1][0]) / 2;
          const yc = (p[i][1] + p[i + 1][1]) / 2;
          d += `Q ${p[i][0]} ${p[i][1]} ${xc} ${yc} `;
        }
        if (p.length > 2) d += `L ${p[p.length - 1][0]} ${p[p.length - 1][1]}`;
        else d += `L ${p[1][0]} ${p[1][1]}`;
        return d;
      }
      if (car.cable_path) return car.cable_path;
      const hay = String(car.images || car._autoBase || car.image_charging ||
                         car.image_side_plugged || car.image_side || "");
      const canon = hay ? shippedPackDir(hay) : null;
      return (canon && PACK_CABLE_PATH[canon]) || null;
    }
    _packCable() {
      const car = this._car;
      /* _cableSet, not the value: CAR_DEFAULTS ships cable:"overlay" as the
         DEFAULT, so testing the value alone matches every car and turns every
         pack lean. Only an EXPLICIT config entry counts. */
      if (car._cableSet && car.cable === "overlay") return car;
      const hay = String(car.images || car._autoBase || "");
      const canon = hay ? shippedPackDir(hay) : null;
      return (canon && PACK_CABLE[canon]) || null;
    }
    _cableBaked() {
      const car = this._car;
      if (car._cableSet) return car.cable === "baked";
      /* a pack that declares the overlay is NOT baked, even though it is a pack */
      if (this._packCable()) return false;
      return !!this._imgBase() || car.cable === "baked";  // pack images ship baked cables
    }
    /* Where the cable meets the car, in view units. Per-car config wins, then
       the pack's own anchors, then the built-in defaults. */
    _portXY(kind) {
      const car = this._car;
      if (car[kind]) return car[kind];
      const pc = this._packCable();
      return (pc && pc[kind]) || CAR_DEFAULTS[kind];
    }
    _probeImages(car) {
      if (car._probed) return;
      car._probed = true;
      if (car.images || car.image || car.image_side) return;   // explicit config wins
      const dir = /3/.test(String(car.model || "")) ? "3" : "y";
      const paint = String(car.paint || "").toLowerCase().replace(/[^a-z]/g, "");
      // Prefer a user-managed local pack, then the images shipped with this HACS
      // dashboard package. HACS installs the contents of dist/ under its repository
      // folder, so these image URLs stay alongside the card and update together.
      const REPO_ROOTS = ["/hacsfiles/sexy-home-assistant-tesla-card/images/",
                          "https://raw.githubusercontent.com/borgqueenx/sexy-home-assistant-tesla-card/main/images/"];
      const roots = ["/local/tesla-fleet-card/images/", REPO_ROOTS[0], REPO_ROOTS[1]];
      /* A generation-qualified pack wins if one exists, so dropping
         images/models/y-juniper/red/app into the repo or into /local is all it
         takes to fix a Juniper red Y. The unqualified path stays as the
         fallback, which keeps the current right-colour-wrong-bodywork
         behaviour for anyone without a matching pack. */
      const gen = this._generation(car);
      let candidates = [];
      roots.forEach((root) => {
        if (paint && gen) candidates.push(root + "models/" + dir + "-" + gen + "/" + paint + "/app");
        if (paint) candidates.push(root + "models/" + dir + "/" + paint + "/app", root + dir + "/" + paint);
        candidates.push(root + dir, root + "models/" + dir + "/app");
      });
      /* Refuse to borrow a pack we KNOW is the other generation's bodywork.
         SHIPPED_GEN records the generation of every pack this repo ships, so
         when the car's generation is known and mismatches, that pack is simply
         a photograph of a different car and the no-pack panel is the honest
         answer - it also names the folder somebody needs to fill. Only the
         repo's own roots are judged this way: a pack of the user's own under
         /local has no recorded generation, so it is left alone. Set
         allow_other_generation on a car to have the old right-colour,
         wrong-bodywork behaviour back. */
      const wrongCar = (url) => {
        if (car.allow_other_generation || !gen) return false;
        for (let i = 0; i < REPO_ROOTS.length; i++) {
          if (url.indexOf(REPO_ROOTS[i]) !== 0) continue;
          const packGen = SHIPPED_GEN[url.slice(REPO_ROOTS[i].length)];
          return !!packGen && packGen !== gen;
        }
        return false;
      };
      candidates = candidates.filter((u) => !wrongCar(u));
      const FILES7 = ["topdown.jpg", "topdown-plugged.jpg", "topdown-charging.jpg",
                      "side.jpg", "side-plugged.jpg", "side-charging.jpg", "climate.jpg", "climate3.jpg"];
      const adopt = (base) => {           // record which of the 7 slots exist, then rebuild once
        car._autoBase = base;
        car._packFiles = {};
        let pending = FILES7.length;
        const done = () => {
          if (--pending === 0 && car === this._car) this._rebuildSoon();
        };
        FILES7.forEach((f) => {
          fetch(base + "/" + f, { method: "HEAD" })
            .then((r) => { if (r.ok) car._packFiles[f] = 1; })
            .catch(() => {})
            .then(done, done);
        });
      };
      const tryNext = (i) => {            // a folder counts as a pack if ANY standard file exists
        if (i >= candidates.length) return;
        const PROBE = ["topdown.jpg", "side.jpg", "climate.jpg", "climate3.jpg"];
        const tryFile = (j) => {
          if (j >= PROBE.length) return tryNext(i + 1);
          fetch(candidates[i] + "/" + PROBE[j], { method: "HEAD" }).then((r) => {
            if (!r.ok) return tryFile(j + 1);
            adopt(candidates[i]);
          }).catch(() => tryFile(j + 1));
        };
        tryFile(0);
      };
      tryNext(0);
    }
    _etaText() {
      const s = this._st("charge_complete");
      if (!s || s.state === "unknown" || s.state === "unavailable") return null;
      const t = new Date(s.state).getTime();
      if (!isNaN(t) && t > Date.now())                        // tesla_custom: ISO timestamp
        return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const mins = this._minsToFull();
      if (isNaN(mins) || mins <= 0) return null;
      return new Date(Date.now() + mins * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    _unit(key, fallback) {
      const s = this._st(key);
      return (s && s.attributes.unit_of_measurement) || fallback || "";
    }
    _call(domain, service, data) {
      const p = this._hass.callService(domain, service, data);
      /* callService returns a promise and the card used to drop it. Combined
         with the optimistic pends below that meant a REJECTED command left the
         card confidently showing the wrong state for the full 25s window and
         then snapping back with no explanation. Tesla rejects commands for
         real reasons: Pet Mode blocks Max Defrost, the car is asleep, you are
         rate limited. An honest blip beats a confident lie. */
      if (p && typeof p.catch === "function") p.catch(() => this._cmdFailed());
    }
    _cmdFailed() {
      this._pend = {};
      this._pendSeat = null; this._pendPreset = null; this._pendFan = null; this._pendCop = null;
      this._toast("Command failed");
      this._update();
    }
    /* centred version of the seat toast, for messages not tied to one seat */
    _toast(label) {
      const g = this.shadowRoot && this.shadowRoot.getElementById("heatToast");
      if (!g) return;
      const txt = this.shadowRoot.getElementById("heatToastTxt");
      const bg = this.shadowRoot.getElementById("heatToastBg");
      if (!txt || !bg) return;
      txt.textContent = label;
      const w = label.length * 7.6 + 18;
      const tx = Math.max(4, 180 - w / 2), ty = 560;
      bg.setAttribute("x", tx); bg.setAttribute("y", ty); bg.setAttribute("width", w);
      txt.setAttribute("x", tx + 9); txt.setAttribute("y", ty + 17);
      g.style.display = "";
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => { g.style.display = "none"; }, 2200);
    }
    _moreInfo(key) {
      const id = this._car._entities[key];
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true }));
    }

    /* two-tap confirm: returns true when the action should run */
    _confirm(key, el, restoreText, confirmText) {
      const lb = el.querySelector(".lb") || el;
      if (!this._arm[key]) {
        this._arm[key] = true;
        el.classList.add("armed");
        const orig = restoreText !== undefined ? restoreText : lb.textContent;
        el.dataset.confirmText = orig;
        lb.textContent = confirmText || "Tap again";
        clearTimeout(this._armT[key]);
        this._armT[key] = setTimeout(() => {
          this._arm[key] = false;
          el.classList.remove("armed");
          lb.textContent = el.dataset.confirmText || orig;
          delete el.dataset.confirmText;
        }, 3000);
        return false;
      }
      this._arm[key] = false;
      el.classList.remove("armed");
      clearTimeout(this._armT[key]);
      lb.textContent = el.dataset.confirmText || restoreText || lb.textContent;
      delete el.dataset.confirmText;
      return true;
    }

    _build() {
      this._built = true;
      /* the driving overlay is filled in by _update, so its cached tier has
         to be forgotten here or a rebuilt card keeps an empty overlay */
      this._driveTier = null;
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const car = this._car;
      const multi = this._cars.length > 1;
      const climateModelLabel = car.climate_hide_model === true && this._view === "clim"
        ? '<span class="nmModel acLabel"><span class="modelSep">| </span>AC</span>'
        : (car.model ? '<span class="nmModel"><span class="modelSep">| </span>' + esc(car.model) + '</span>' : "");
      const carOffsetX = Number.isFinite(Number(car.car_offset_x)) ? Number(car.car_offset_x) : 0;
      const nameStatsGap = Number.isFinite(Number(car.name_stats_gap)) ? Number(car.name_stats_gap) : 0;
      const nameStatsTranslateY = -20 + nameStatsGap;
      /* climate view framing, in percent of the image box. Defaults show the
         hood and windscreen; the tail may run off the bottom. */
      const climTopN = Number(car.climate_car_top), climHN = Number(car.climate_car_height);
      const climTop = Number.isFinite(climTopN) ? climTopN : 1;
      const climH = Number.isFinite(climHN) && climHN > 0 ? climHN : 120;
      /* climate_car_left: horizontal centre of the car in the climate view.
         number = percent of card width (default 70); "px"/"%" strings pass through. */
      const climLeftRaw = car.climate_car_left;
      const climLeft = (typeof climLeftRaw === "string" && /^\s*-?\d+(\.\d+)?(px|%)\s*$/.test(climLeftRaw))
        ? climLeftRaw.trim()
        : (climLeftRaw !== undefined && climLeftRaw !== null && climLeftRaw !== "" && Number.isFinite(Number(climLeftRaw)) ? Number(climLeftRaw) + "%" : "70%");
      const climBackSizeN = Number(car.climate_back_size);
      const climBackSize = Number.isFinite(climBackSizeN) && climBackSizeN > 0 ? climBackSizeN : 28;
      const climControlsGapN = Number(car.climate_controls_gap);
      const climControlsGap = Number.isFinite(climControlsGapN) ? Math.max(-64, Math.min(64, climControlsGapN)) : 6;
      const climTempGapN = Number(car.climate_temp_gap);
      const climTempGap = Number.isFinite(climTempGapN) ? Math.max(-32, Math.min(32, climTempGapN)) : 4;
      const climateCssPosition = (value, fallback) => {
        if (typeof value === "string" && /^\s*-?\d+(?:\.\d+)?(?:px|%)\s*$/.test(value)) return value.trim();
        return value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value)) ? Number(value) + "px" : fallback;
      };
      const climBackLeft = climateCssPosition(car.climate_back_x !== undefined ? car.climate_back_x : car.climate_back_left, "auto");
      const climBackTop = climateCssPosition(car.climate_back_y !== undefined ? car.climate_back_y : car.climate_back_top, "auto");
      const climLeftTopN = Number(car.climate_left_top);
      const climLeftTop = Number.isFinite(climLeftTopN) ? climLeftTopN : 108;
      const climateVerticalOffset = (key) => {
        const value = car[key];
        return value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value)) ? Number(value) : 0;
      };
      const climTempsY = climateVerticalOffset("climate_temps_y");
      const climControlsY = climateVerticalOffset("climate_controls_y");
      const climModesY = climateVerticalOffset("climate_modes_y");
      const climCopY = climateVerticalOffset("climate_cop_y");
      const climateControlsBottom = String(car.climate_controls_position || "left").trim().toLowerCase() === "bottom";
      const climateViewClass = this._view === "clim"
        ? `climMode${climateControlsBottom ? " climControlsBottom" : ""}`
        : (this._view === "map" ? "mapMode" : "");
      this.shadowRoot.innerHTML = `
<style>
  :host { display:block; position:relative; isolation:isolate; --clim-top:${climTop}%; --clim-h:${climH}%; --clim-left:${climLeft}; --clim-left-top:${climLeftTop}px; --clim-back-size:${climBackSize}px; --clim-back-left:${climBackLeft}; --clim-back-top:${climBackTop}; --clim-controls-gap:${climControlsGap}px; --clim-temp-gap:${climTempGap}px; --clim-temps-y:${climTempsY}px; --clim-controls-y:${climControlsY}px; --clim-modes-y:${climModesY}px; --clim-cop-y:${climCopY}px; }
  * { box-sizing:border-box; -webkit-text-size-adjust:100%; text-size-adjust:100%; }
  ha-card {
    background:#151617; color:#ececec; border-radius:16px; overflow:hidden;
    font-family:-apple-system,'Segoe UI',Roboto,sans-serif; padding:16px 16px 4px; position:relative;
  }
  .hdr { display:flex; align-items:flex-start; justify-content:space-between; }
  .nmBtn { background:none; border:none; padding:0; color:inherit; font:inherit;
    display:flex; align-items:center; gap:3px; cursor:${multi ? "pointer" : "default"}; }
  .nm { font-size:24px; font-weight:600; letter-spacing:.2px; }
  .nmTitle { display:flex; align-items:baseline; gap:8px; transform:translateY(-15px); }
  .nmModel { display:inline-block; font-size:12px; font-weight:400; color:#9b9b9b; letter-spacing:.3px; }
  .nmModel.acLabel { -webkit-text-stroke:1px #151617; paint-order:stroke fill; }
  .nmBtn svg { width:19px; height:19px; fill:#8a8a8a; margin-top:3px; ${multi ? "" : "display:none;"} }
  .carStage { position:relative; }
  .infoStack { display:block; }
  .infoHome > .infoStack { transform:translateY(${nameStatsTranslateY}px); }
  .chargeInfoMoved #infoHome { min-height:38px; }
  .carStage > .infoStack { position:absolute; left:8px; top:0; bottom:auto; z-index:4; display:flex; flex-direction:column-reverse; align-items:flex-start; width:max-content; max-width:calc(100% - 16px); white-space:nowrap; }
  .carStage > .infoStack .sub { margin-top:.5px; }
  .infoStack.drivingInfo { display:flex; flex-direction:column-reverse; align-items:flex-start; }
  .infoStack.drivingInfo .sub { margin-top:.5px; }
  .speedLine { display:none; font-size:13px; color:#9b9b9b; margin-top:.5px; white-space:nowrap; }
  .speedLine.show { display:block; }
  .battLine { display:flex; align-items:center; gap:7px; margin-top:.5px; color:#9b9b9b; font-size:13px; }
  .battLine #battDefrost { display:flex; }
  .battLine #battDefrost svg { width:12px; height:13px; }
  .chgBtns { display:none; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
  .chgBtns.show { display:grid; }
  .chgBtns button { background:#1f1f1f; border:none; color:#dcdcdc; font-family:inherit;
    font-size:12.5px; padding:9px 0; border-radius:10px; cursor:pointer; }
  .chgBtns button:active { background:#2c2c2c; }
  .climWrap { margin-bottom:8px; }
  .climExtrasOverlay { position:absolute; left:10px; right:auto; top:67%; bottom:auto; transform:translateY(-50%); z-index:4; display:flex; flex-direction:column; align-items:center; gap:6px; width:25%; max-width:145px; pointer-events:none; }
  .climExtrasOverlay:empty { display:none; }
  .climExtrasOverlay .climX { width:100%; margin:0; padding:6px 5px; border:1px solid #ffffff24; border-radius:8px; background:#171717b8; font-size:11px; line-height:1.2; text-align:center; white-space:normal; overflow-wrap:anywhere; pointer-events:auto; }
  .climMode .climExtrasOverlay { position:absolute; left:16px; right:auto; top:66%; bottom:auto; transform:translateY(-50%); z-index:13; width:25%; max-width:145px; }
  /* Left-side climate stack: temperatures, one unbroken AC row, then mode buttons. */
  .climMode .climLeft { position:absolute; left:16px; width:calc(var(--clim-left) - 32px); top:0; display:flex; flex-direction:column;
    align-items:stretch; z-index:24; pointer-events:none; }
  .climMode .climPage > .climTemps { position:absolute; left:16px; top:50%; transform:translateY(-50%); min-height:0; display:block;
    width:var(--clim-panel-width,calc(var(--clim-left) - 32px)); max-width:none; margin:0; padding:0; white-space:pre-line; line-height:1.35; text-align:left; z-index:14; }
  .climMode .climPage > .climTemps { translate:0 var(--clim-temps-y,0px); }

  ha-card.climMode > #ctlBack { position:absolute; left:var(--clim-back-left); top:var(--clim-back-top);
    width:var(--clim-back-size); height:var(--clim-back-size); min-width:var(--clim-back-size); min-height:var(--clim-back-size);
    display:flex; align-items:center; justify-content:center; padding:0; border-radius:50%; font-size:calc(var(--clim-back-size) * .7);
    line-height:1; color:#ececec; cursor:pointer; pointer-events:auto; z-index:100; background:#2b2b2bf2; border:1px solid #ffffff30; box-shadow:0 2px 8px #0008; }
  /* the header sits above the car box; its text lines must not swallow taps meant for the back button */
  .climMode .infoHome, .climMode .infoStack, .climMode .battLine, .climMode .sub, .climMode .speedLine { pointer-events:none; }
  .climMode .climLeft .climExtrasOverlay { position:absolute; left:0; top:calc(var(--clim-left-top) + 61px); right:auto; bottom:auto;
    transform:none; display:flex; flex-direction:column; flex-wrap:nowrap; align-items:stretch; gap:6px;
    width:100%; max-width:none; pointer-events:none; white-space:normal; }
  .climMode .climLeft .climExtrasOverlay > * { pointer-events:auto; }
  .climMode .climLeft .climExtrasOverlay > .climCtl { align-self:flex-start; display:flex; flex-direction:row; flex-wrap:nowrap;
    align-items:center; justify-content:flex-start; gap:0; width:max-content; max-width:none; margin:0 0 26px; white-space:nowrap; }
  .climMode .climLeft .climExtrasOverlay > .climCtl > * + * { margin-left:var(--clim-controls-gap,6px); }
  .climMode .climLeft .climExtrasOverlay > .climCtl > * { flex:0 0 auto; }
  .climMode:not(.climControlsBottom) .climLeft .climCtl { margin-left:-8px; }
  .climMode .climLeft .climExtrasOverlay > .climModesBlock { display:flex; flex-direction:column; align-items:stretch; gap:6px; width:100%; translate:0 var(--clim-modes-y,0px); }
  .climMode .climLeft .climExtrasOverlay > .climModesBlock > .climX { align-self:stretch; width:100%; min-width:0; max-width:none; white-space:nowrap; flex:none; }
  .climMode .climLeft .climExtrasOverlay > .climCtl { translate:0 var(--clim-controls-y,0px); }
  .climMode.climControlsBottom .climLeft { left:0; top:0; bottom:12px !important; width:100% !important; height:auto; align-items:stretch; }
  .climMode.climControlsBottom .climLeft .climTemps { left:16px; width:var(--clim-panel-width,calc(var(--clim-left) - 32px)); }
  .climMode.climControlsBottom .climLeft .climExtrasOverlay { position:static; inset:auto; transform:none; display:flex;
    flex-direction:column; align-items:stretch; align-self:flex-start; gap:6px; width:var(--clim-panel-width,calc(var(--clim-left) - 32px));
    max-width:none; margin:calc(var(--clim-left-top) + 61px) 0 0 16px; padding-top:var(--clim-controls-placeholder,0px); }
  .climMode.climControlsBottom .climLeft .climExtrasOverlay > .climCtl { position:absolute; left:50%; top:auto; bottom:0;
    transform:translateX(-50%); align-self:center; max-width:calc(100% - 32px); margin:0; }
  .climImg { max-height:360px; }
  .carDepart { position:absolute !important; z-index:20; margin:0 !important; max-width:none !important;
    pointer-events:none !important; transform-origin:center; will-change:transform,opacity; }
  .carDepart.toClimateUnplugged { animation:teslaAwayLowerLeft var(--climate-away-duration,.75s) cubic-bezier(.36,.02,.9,.34) both; }
  .carDepart.toClimatePlugged { animation:teslaAwayUpperLeft var(--climate-away-duration,.75s) cubic-bezier(.36,.02,.9,.34) both; }
  .carDepart.fromClimate { animation:climateAwayUp var(--climate-away-duration,.75s) cubic-bezier(.2,.1,.9,.34) both; }
  .climWrap.driveIn { transform-origin:center bottom; will-change:transform,opacity;
    animation:climateDriveUp var(--climate-drive-in-duration,.72s) cubic-bezier(.14,.7,.22,1) var(--climate-drive-in-delay,.64s) both; }
  .climMode .climWrap.driveIn .climImg,
  .climMode .climWrap.driveIn svg.ovl { animation:climateImageRaise var(--climate-drive-in-duration,.72s) cubic-bezier(.14,.7,.22,1) var(--climate-drive-in-delay,.64s) both; }
  .mainArrival { animation:mainCarArrive var(--climate-drive-in-duration,.72s) cubic-bezier(.12,.7,.22,1) var(--climate-drive-in-delay,.64s) both; }
  .mainArrival.mainArrivalPlugged { animation-name:mainCarArrivePlugged; }
  .mainUIArrival { animation:climateControlsIn .36s ease var(--climate-ui-in-delay,0s) both; }
  .restHotspotsPending { opacity:0 !important; visibility:hidden; pointer-events:none !important; }
  .restHotspotsFadeIn { visibility:visible; animation:climateControlsIn .36s ease var(--climate-ui-in-delay,0s) both; }
  .climMode .climateMenuIn { animation:climateControlsIn .36s ease var(--climate-ui-in-delay,0s) both; }
  .transitionFadeLive { animation:transitionFade var(--climate-away-duration,.5625s) linear both; pointer-events:none !important; }
  .transitionSourceHidden { opacity:0 !important; visibility:hidden !important; pointer-events:none !important; }
  .snapLayer { position:absolute; inset:0; z-index:30; overflow:hidden; border-radius:16px;
    font-family:-apple-system,'Segoe UI',Roboto,sans-serif; color:#ececec; -webkit-text-size-adjust:100%; text-size-adjust:100%; }
  .snapLayer, .snapLayer * { pointer-events:none !important; }
  .snapLayer.carSnapLayer { z-index:10; }
  .snapLayer.cableSnapLayer { z-index:8; }
  @keyframes teslaAwayLowerLeft {
    0% { transform:translate3d(0,0,0) scale(1); opacity:1; }
    38% { transform:translate3d(-9%,7%,0) scale(1.025); opacity:1; }
    100% { transform:translate3d(-150%,155%,0) scale(.58); opacity:0; }
  }
  @keyframes teslaAwayUpperLeft {
    0% { transform:translate3d(0,0,0) scale(1); opacity:1; }
    38% { transform:translate3d(-9%,-7%,0) scale(1.025); opacity:1; }
    100% { transform:translate3d(-150%,-145%,0) scale(.58); opacity:0; }
  }
  @keyframes climateAwayUp {
    from { transform:translate3d(0,0,0); }
    to { transform:translate3d(0,calc(-2% - var(--clim-top) - var(--clim-h)),0); }
  }
  @keyframes climateDriveUp {
    from { transform:translate3d(0,calc(100% + 64px - var(--clim-top)),0); opacity:1; }
    to { transform:translate3d(0,0,0); opacity:1; }
  }
  @keyframes climateImageRaise { from { top:calc(var(--clim-top) + 16%); } to { top:var(--clim-top); } }
  @keyframes climateControlsIn { from { opacity:0; } to { opacity:1; } }
  @keyframes climateCtlArrive { from { opacity:0; transform:translate(-50%,88px); } to { opacity:1; transform:translate(-50%,0); } }
  @keyframes mainCarArrive { from { transform:translate3d(125%,-92%,0); opacity:0; } to { transform:translateX(var(--car-offset-x,0px)); opacity:1; } }
  @keyframes mainCarArrivePlugged { from { transform:translate3d(125%,92%,0); opacity:0; } to { transform:translateX(var(--car-offset-x,0px)); opacity:1; } }
  @keyframes transitionFade { from { opacity:1; } to { opacity:0; } }
  @media (prefers-reduced-motion:reduce) {
    .carDepart, .climWrap.driveIn, .mainArrival, .mainUIArrival, .climateMenuIn, .transitionFadeLive, .restHotspotsFadeIn {
      animation-duration:.01ms; animation-delay:0ms; }
  }
  .defrostBtn { display:block; width:100%; background:#1f1f1f; border:none; color:#dcdcdc;
    font-family:inherit; font-size:12.5px; padding:10px 0; border-radius:10px; cursor:pointer; margin-top:12px; }
  .defrostBtn.on { color:#4fa3ff; }
  /* honest "sent, waiting for the car" state rather than a silent lie */
  .defrostBtn.pending, .pwr.pending { animation:dfPulse 1.5s ease-in-out infinite; }
  @keyframes dfPulse { 0%,100% { opacity:1 } 50% { opacity:.55 } }
  @media (prefers-reduced-motion:reduce) {
    .defrostBtn.pending, .pwr.pending { animation:none; opacity:.75 } }
  .defrostBtn:active { background:#2c2c2c; }
  .battGlyph { width:24px; height:11px; border:1.5px solid #6f6f6f; border-radius:3px; position:relative; }
  .battGlyph:after { content:""; position:absolute; right:-4px; top:2.5px; width:2.5px; height:4px;
    background:#6f6f6f; border-radius:0 1px 1px 0; }
  .battFill { position:absolute; left:1px; top:1px; bottom:1px; background:#8f9296; border-radius:1px; }
  .battFill.chg { background:#4fd07a; } .battFill.low { background:#e0a63c; } .battFill.crit { background:#d53a3a; }
  .noPack { padding:26px 20px 22px; text-align:center; color:#c9ccd1; }
  .noPackCar { width:92px; height:44px; color:#5b6068; display:block; margin:0 auto 6px; }
  .noPackQuip { font-size:12px; font-style:italic; line-height:1.5; color:#71767d;
                max-width:330px; margin:0 auto 13px; }
  .noPackTitle { font-size:15px; font-weight:600; color:#e9eaec; margin-bottom:7px; }
  .noPackBody { font-size:12.8px; line-height:1.5; max-width:330px; margin:0 auto 12px; }
  .noPackBody b { color:#e9eaec; }
  .noPackHave { font-size:12.8px; line-height:1.5; max-width:330px; margin:0 auto 12px;
                background:#1b1d21; border:1px solid #2b2e33; border-radius:8px; padding:9px 12px; }
  .noPackHave ul { margin:6px 0; padding:0; list-style:none; }
  .noPackHave li { padding:2px 0; color:#e9eaec; }
  .noPackPath { font-family:ui-monospace,Menlo,monospace; font-size:11.5px; color:#8d9298;
                background:#141619; border:1px solid #26282c; border-radius:6px;
                padding:6px 9px; display:inline-block; margin-bottom:12px; }
  .noPack a { color:#5ea0ff; }
  .noPack a.packCta { font-size:14.5px; font-weight:600; }
  .diag { margin-top:7px; padding:8px 10px; border-radius:7px; font-size:12.5px; line-height:1.45;
          background:#3a2411; border:1px solid #6b4318; color:#f0c99a; max-width:520px; }
  .diag code { background:#00000055; padding:1px 4px; border-radius:3px; font-size:12px; }
  .diag b { color:#fff; }
  .sub { font-size:13px; color:#9b9b9b; margin-top:5px; }
  .hdr-r { display:flex; align-items:center; gap:8px; transform:translateY(-8px); }
  .icobtn { background:none; border:none; width:32px; height:32px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .icobtn svg { width:18px; height:18px; fill:#b8b8b8; }
  .icobtn:active { background:#242424; }
  .spin svg { animation: rot 1s linear infinite; }
  .rowHead svg.climFan.spin { animation:rot 1s linear infinite; }
  @keyframes rot { to { transform:rotate(360deg);} }

  .carMenu { position:absolute; z-index:5; margin-top:4px; background:#242424; border-radius:12px;
    box-shadow:0 8px 24px #000a; overflow:hidden; }
  .carMenu[hidden] { display:none; }
  .carMenu button { display:flex; align-items:center; gap:8px; width:100%; text-align:left;
    background:none; border:none; color:#ececec; font:inherit; font-size:14px;
    padding:10px 16px; cursor:pointer; }
  .carMenu button:hover { background:#2e2e2e; }
  .dot { width:10px; height:10px; border-radius:50%; display:inline-block; border:1px solid #555; }

  .carBox { margin:4px auto 0; max-width:330px; position:relative; transform:translateX(var(--car-offset-x, 0px)); }
  /* car_offset_x is for the exterior car artwork; keep the portrait cabin centered. */
  .climMode .carBox { transform:none; }
  .climMode .hdr { position:absolute; top:0; left:0; right:0; z-index:12; }
  .climMode .carStage { display:flex; flex:1 1 auto; min-height:0; flex-direction:column; margin:-16px -16px -4px; }
  .climMode #carBox { margin:0; width:100%; max-width:none; flex:1 1 auto; min-height:0;
    display:block; transform:none; position:relative; z-index:9; }
  ha-card.climMode { display:flex; flex-direction:column; background:#151617; }
  .climMode .hdr { position:absolute; top:16px; left:16px; right:16px; flex:none; }
  .climMode .climWrap { position:absolute; inset:0 0 64px; width:100%; max-width:100%; margin:0;
    display:block; overflow:visible; }
  .climMode .imgWrap:not(.rest) .climImg { position:absolute; left:var(--clim-left); top:var(--clim-top); transform:translateX(-50%);
    width:auto; height:var(--clim-h); max-width:none; max-height:none; object-fit:contain; }
  .climMode .climWrap svg.ovl { position:absolute; top:var(--clim-top); left:var(--clim-left);
    width:auto; height:var(--clim-h); max-width:none; aspect-ratio:1095/2256; transform:translateX(-50%); }
  .carDepart.fromClimate.climWrap { display:block; overflow:visible; }
  .carDepart.fromClimate.climWrap .climImg { position:absolute; left:var(--clim-left); top:var(--clim-top); transform:translateX(-50%);
    width:auto; height:var(--clim-h); max-width:none; max-height:none; }
  .carDepart.fromClimate svg.ovl { position:absolute; top:var(--clim-top); left:var(--clim-left); width:auto; height:var(--clim-h);
    aspect-ratio:1095/2256; transform:translateX(-50%); }
  .climMode .climPage { position:absolute; inset:0; width:100%; max-width:none; margin:0; pointer-events:none; }
  .climCableLayer { position:absolute; inset:0; width:100%; height:100%; overflow:visible; z-index:8; pointer-events:none; }
  .climMode #climCableLive { stroke-opacity:.72; }
  .climMode #climCableDashLive { stroke-opacity:.72; }
  .climMode .climLeft .climCtl #climPwr, .climMode .climLeft .climCtl #climVent { width:auto; flex:0 0 auto; }
  .climMode .climLeft .climCtl .climTempAdjust { display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; justify-content:center; gap:0; flex:0 0 auto; }
  .climMode .climLeft .climCtl .climTempAdjust > * + * { margin-left:var(--clim-temp-gap,4px); }
  .climMode .climLeft .climCtl #tDn, .climMode .climLeft .climCtl #tTgt, .climMode .climLeft .climCtl #tUp { flex:0 0 auto; }
  .climMode .climLeft .climCtl #tTgt { font-size:28px; min-width:0; padding:0 2px; position:relative; }
  .climMode .climTemps { position:absolute; left:16px; top:calc(19.5% + 43px); width:calc(var(--clim-left) - 32px); max-width:none; margin:0;
    padding:0; border-radius:6px; background:transparent; transform:translateY(-50%); white-space:pre-line; line-height:1.35;
    text-align:center; z-index:14; text-shadow:0 1px 4px #000,0 0 7px #000; }
  .climMode #carBox > .backBtn { top:var(--clim-back-top); left:var(--clim-back-left); z-index:30; width:var(--clim-back-size); height:var(--clim-back-size);
    display:flex; align-items:center; justify-content:center; padding:0; pointer-events:auto;
    background:#2b2b2bf2; border:1px solid #ffffff30; box-shadow:0 2px 8px #0008; }
  ha-card.climMode > #ctlBack .backChevron { display:block; width:22px; height:22px; flex:none; }
  ha-card.climMode > #ctlBack .backChevron path { fill:none; stroke:#ececec; stroke-width:2.8; stroke-linecap:round; stroke-linejoin:round; }
  /* degree sign hangs off the number, so it does not count for centering */
  .climCtl .big .tDeg { position:static; display:inline-block; margin-left:1px; font-size:.55em; line-height:1; vertical-align:super; }
  .climMode .copWrap { position:absolute; left:12px; bottom:64px; z-index:24; pointer-events:auto; translate:0 var(--clim-cop-y,0px); }
  .climMode .nmTitle, .climMode .infoStack { text-shadow:0 1px 5px #000; }
  .climMode .infoStack { opacity:1; z-index:25; }
  .climMode .nmModel { display:inline-block; }
  .hdr { position:relative; z-index:31; pointer-events:none; }
  .hdr * { pointer-events:auto; }
  svg.car { width:100%; height:auto; display:block; }
  .imgWrap { position:relative; width:fit-content; margin:0 auto; }
  .imgWrap:not(.rest) .carImg { width:auto; max-width:100%; max-height:420px; }
  .imgWrap.rest { position:relative; overflow:visible; margin:${car.rest_car_margin || "-75px -10px -10px auto"}; width:${car.rest_car_width || "280px"}; }
  @keyframes suspBounce { 0%,100% { translate:0 0; } 50% { translate:0 2px; } }
  .imgWrap.rest.driving { animation: suspBounce 1.4s ease-in-out infinite; will-change:translate; }
  .restOvlBtn { cursor:pointer; }
  .restFrunkHitButton { position:absolute; z-index:40; display:none; margin:0; padding:0; border:0;
    background:transparent; cursor:pointer; pointer-events:auto; }
  .restOvlBtn text.rLbl { fill:#e6e6e6; font-size:7.5px; font-weight:600; font-family:inherit; stroke:#000; stroke-width:1px; stroke-linejoin:round; paint-order:stroke fill; }
  .restOvlBtn line { stroke:#ffffff44; stroke-width:0.4; }
  .restOvlBtn circle.rDot { fill:#ffffff66; r:1.2; }
  .restOvlBtn:hover text.rLbl { fill:#fff; }
  .restOvlBtn.armed text.rLbl { fill:#e0a63c !important; }
  .restOvlBtn.armed line { stroke:#e0a63c88; }
  .restOvlBtn.armed circle.rDot { fill:#e0a63c; }
  .ctlBtn { position:absolute; left:50%; transform:translateX(-50%); bottom:6px;
    background:#2b2b2bd9; border:none; color:#e6e6e6; font-family:inherit; font-size:12.5px;
    padding:6px 18px; border-radius:15px; cursor:pointer; }
  .ctlBtn:active { background:#3a3a3a; }
  .backBtn { position:absolute; left:0; top:0; z-index:2; background:#2b2b2bd9; border:none;
    color:#e6e6e6; font-size:18px; line-height:1; padding:5px 12px 7px; border-radius:15px; cursor:pointer; }
  .backBtn:active { background:#3a3a3a; }
  /* On the map the small bare chevron disappears into the tiles, and the map
     itself is draggable so it cannot double as a way out. Nick: "the back
     button is not obvious". So the map view gets a labelled pill with real
     contrast, its own border and a shadow, sized as a proper tap target. */
  /* BOTTOM left, not top: the map card's own zoom controls sit top-left and
     this pill landed straight on them. top:auto is not optional here: .backBtn
     sets top:0 and both selectors are one class, so without it the pill stays
     pinned to the top and quietly covers the zoom buttons again. */
  .mapBack { left:10px; top:auto; bottom:10px; display:inline-flex; align-items:center; gap:6px;
    font-size:13px; font-weight:600; line-height:1; color:#fff; padding:9px 14px 9px 11px;
    background:#161616f2; border:1px solid #ffffff2e; border-radius:10px;
    box-shadow:0 2px 8px #00000073; }
  .mapBack:hover { background:#242424f2; }
  .mapBack .bch { font-size:17px; margin-top:-2px; }
  .carImg { width:100%; display:block; }
  svg.ovl { position:absolute; left:0; bottom:0; width:100%; aspect-ratio:660/400; overflow:visible; z-index:2; }
  svg.car text { font-family:-apple-system,'Segoe UI',Roboto,sans-serif; }
  .tapa { cursor:pointer; }
  /* mist animation is SMIL (in the SVG markup) - CSS transforms on filtered
     SVG elements don't animate on iOS WebKit (HA companion app) */
  /* Centred, like Defrost Car directly above them. They were left-aligned
     with a padding-left, which put four buttons in one column under two
     different alignments. */
  .climX { margin-top:8px; }
  .climX.on { color:#4fa3ff; }
  .copWrap { margin-top:14px; }
  .copLbl { font-size:12.5px; color:#9b9b9b; margin-bottom:7px; }
  .copSeg { display:flex; background:rgba(31,31,31,.8); border-radius:10px; padding:3px; gap:3px; }
  .copSeg button { flex:1; background:none; border:none; color:#9b9b9b; font-family:inherit;
    font-size:12.5px; padding:7px 0; border-radius:8px; cursor:pointer; }
  .copSeg button.on { background:rgba(58,58,58,.9); color:#fff; }
  .calib { position:absolute; top:4px; right:4px; z-index:3; pointer-events:none;
    background:#000000cc; color:#ffd47f; font-size:11px; padding:3px 9px; border-radius:8px; }
  .tapa.armed text.olbl { fill:#e0a63c !important; }

  .acts { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); justify-items:center; margin:2px 12px 4px; overflow:visible; }
  .abtn { display:flex; flex-direction:column; align-items:center; gap:5px; min-width:0; width:100%;
    background:none; border:none; cursor:pointer; color:#a8a8a8; font-size:10.5px;
    font-family:inherit; padding:6px 1px; border-radius:10px; white-space:nowrap; }
  .abtn svg { width:22px; height:22px; fill:#d9d9d9; }
  #aLock svg { width:26px; height:26px; margin-top:-4px; }
  .abtn:active { background:#242424; }
  .abtn.armed { color:#e0a63c; } .abtn.armed svg { fill:#e0a63c; }
  .abtn.on svg { fill:#4fa3ff; } .abtn.on { color:#4fa3ff; }
  .abtn.locked { color:#90c99a; } .abtn.locked svg { fill:#90c99a; }
  .abtn:disabled { opacity:.55; cursor:default; }
  @keyframes sentryPulse { 0% { fill: #d9d9d9; color: #a8a8a8; } 50% { fill: #cc0000; color: #cc0000; } 100% { fill: #d9d9d9; color: #a8a8a8; } }
  #aSentry.on svg { animation: sentryPulse 3s infinite; fill: #d9d9d9; }
  #aSentry.on { animation: sentryPulse 3s infinite; color: #a8a8a8; }

  .rows { margin-top:6px; border-top:1px solid #262626; }
  .row { border-bottom:1px solid #262626; }
  .row:last-child { border-bottom:none; }
  .rowHead { display:flex; align-items:center; gap:12px; width:100%; background:none; border:none;
    color:#ececec; font:inherit; text-align:left; padding:13px 4px; cursor:pointer; }
  .rowHead > svg.ric { width:20px; height:20px; fill:#c9c9c9; flex:none; }
  .rTitle { font-size:15px; font-weight:500; }
  .rSub { font-size:12px; color:#8f8f8f; margin-top:1px; }
  .rowHead .chev { margin-left:auto; width:18px; height:18px; fill:#6f6f6f; flex:none; transition:transform .2s; }
  .row.open .chev { transform:rotate(90deg); }
  .rowBody { display:none; padding:2px 4px 14px 36px; }
  .row.open .rowBody { display:block; }

  .climCtl { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:nowrap; min-width:0; }
  .climCtl .big { font-size:34px; font-weight:300; min-width:70px; text-align:center; flex-shrink:0; }
  .arrow { background:none; border:none; color:#8f8f8f; font-size:${(car.climate_icon_size || 24) + 2}px; cursor:pointer; padding:4px 6px; flex-shrink:0; }
  .arrow:active { color:#fff; }
  .pwr { display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:none;
    color:#a8a8a8; font-size:10.5px; font-family:inherit; cursor:pointer; min-width:40px; flex-shrink:0; padding:4px; }
  .pwr svg { width:${car.climate_icon_width || car.climate_icon_size || 24}px !important; height:${car.climate_icon_height || car.climate_icon_size || 24}px !important; min-width:${car.climate_icon_width || car.climate_icon_size || 24}px !important; min-height:${car.climate_icon_height || car.climate_icon_size || 24}px !important; fill:#d9d9d9; flex-shrink:0 !important; display:block !important; }
  .pwr.on svg { fill:#4fa3ff; } .pwr.on { color:#4fa3ff; }

  .chgLine1 { font-size:13.5px; color:#ececec; }
  .chgLine1 b { font-weight:700; }
  .chgLine1 span { color:#8f8f8f; }
  .chgLine2 { font-size:12.5px; color:#8f8f8f; margin-top:4px; }
  .sliderWrap { position:relative; margin:14px 0 6px; }
  .limTick { position:absolute; left:80%; top:50%; transform:translate(-50%,-50%);
    width:2.5px; height:15px; background:#6f6f6f; border-radius:1.5px; pointer-events:none; }
  .chgSlider { width:100%; margin:0; display:block; accent-color:#4fd07a;
    position:relative; z-index:1; background:transparent; }
  .ampRow { display:flex; align-items:center; justify-content:center; gap:6px;
    background:#1f1f1f; border-radius:10px; padding:4px 6px; margin-top:8px; }
  .ampRow span { font-size:14px; font-weight:600; min-width:52px; text-align:center; }
  .ampRow button { background:none; border:none; color:#8f8f8f; font-size:20px;
    cursor:pointer; padding:2px 22px; }
  .ampRow button:active { color:#fff; }

  .ftr { display:flex; justify-content:space-between; margin-top:10px; font-size:11px; color:#6f6f6f; }
  /* The preview strip is NOT hidden by climMode or mapMode: the whole
     point is stepping through states while looking at any view. */
  .pvw { display:flex; flex-wrap:wrap; gap:5px; margin-top:12px; padding-top:10px;
         border-top:1px dashed #4a4a4a; }
  .pvw button { background:#242424; border:1px solid #3a3a3a; color:#c9ccd1;
         font-size:11px; padding:5px 9px; border-radius:7px; cursor:pointer; }
  .pvw button:hover { background:#2f2f2f; }
  .pvw button.on { background:#e82127; border-color:#e82127; color:#fff; font-weight:600; }
  .pvwNote { font-size:10.5px; color:#6f6f6f; margin-top:7px; }
  .climMode .acts, .climMode .rows, .climMode .ftr { display:none; }
  .mapMode .acts, .mapMode .rows, .mapMode .ftr { display:none; }
  /* The map card is Home Assistant's own, so it brings its own ha-card
     chrome. Strip that, or you get a card inside a card. */
  .mapBox { position:relative; border-radius:10px; overflow:hidden; min-height:260px; }
  .mapBox ha-card { border:none; box-shadow:none; background:none; border-radius:10px; }
  .mapNote { padding:26px 20px; text-align:center; color:#9b9b9b; font-size:13px; line-height:1.5; }
  .climPage { max-width:400px; margin:0 auto; }
  .climTemps { text-align:center; color:#9b9b9b; font-size:13px; margin:10px 0 6px; }
</style>
<ha-card class="${climateViewClass}"${this._climateMainHeight ? ` style="height:${this._climateMainHeight}px;min-height:${this._climateMainHeight}px"` : ""}>
  <div class="carStage" id="carStage" style="--car-offset-x:${carOffsetX}px">
  <div class="hdr">
    <div style="position:relative">
      <button class="nmBtn" id="nmBtn"><span class="nmTitle"><span class="nm">${car.name}</span>${climateModelLabel}</span>${svgIcon(ICONS.chev)}</button>
      <div id="infoHome" class="infoHome"><div class="infoStack" id="infoStack">
        <div class="sub" id="sub">-</div>
        <div class="speedLine" id="speedLine"></div>
        <div class="battLine"><span class="battGlyph"><span class="battFill" id="battFill"></span></span>
          <span id="battTxt">-</span><span id="battDefrost" style="display:none" title="Defrost on"><svg viewBox="0 0 24 24"><path d="M6 21 q4 -4.5 0 -9 q-4 -4.5 0 -9 M12 21 q4 -4.5 0 -9 q-4 -4.5 0 -9 M18 21 q4 -4.5 0 -9 q-4 -4.5 0 -9" fill="none" stroke="#ff8c42" stroke-width="2.4" stroke-linecap="round"/></svg></span></div>
      </div></div>
      <div class="diag" id="diag" hidden></div>
      <div class="carMenu" id="carMenu" hidden></div>
    </div>
    <div class="hdr-r">
      <button class="icobtn" id="btnRefresh" title="Force data update">${svgIcon(ICONS.refresh)}</button>
    </div>
  </div>

  <div class="carBox" id="carBox"></div>
  <button class="restFrunkHitButton" id="restFrunkHitButton" type="button" aria-label="Frunk"></button>
  </div>

  <div class="acts">
    <button class="abtn" id="aFlash">${svgIcon(ICONS.flash)}<span class="lb">Flash</span></button>
    <button class="abtn" id="aHonk">${svgIcon(ICONS.horn)}<span class="lb">Honk</span></button>
    <button class="abtn" id="aPort">${svgIcon(ICONS.plug)}<span class="lb">Port</span></button>
    <button class="abtn" id="aLock" aria-label="Lock status">${svgIcon(ICONS.lock)}<span class="lb">Unavailable</span></button>
    <button class="abtn" id="aStart">${svgIcon(ICONS.power)}<span class="lb">Start</span></button>
    <button class="abtn" id="aVent">${svgIcon(ICONS.vent)}<span class="lb">Vent</span></button>
    <button class="abtn" id="aSentry">${svgIcon(ICONS.sentry)}<span class="lb">Sentry</span></button>
  </div>

  <div class="rows">
    <div class="row" id="rowClim">
      <button class="rowHead" id="headClim">${svgIcon(ICONS.fan, "ric climFan")}
        <span><span class="rTitle">Climate</span><div class="rSub" id="climSub">-</div></span>
        ${svgIcon(ICONS.chevR, "chev")}</button>

    </div>
    <div class="row" id="rowChg">
      <button class="rowHead" id="headChg">${svgIcon(ICONS.bolt, "ric")}
        <span><span class="rTitle">Charging</span><div class="rSub" id="chgSub">-</div></span>
        ${svgIcon(ICONS.chevR, "chev")}</button>
      <div class="rowBody">
        <div class="chgLine1">Charge limit: <b id="cLimVal">-</b><span id="chgState"></span></div>
        <div class="chgLine2" id="chgLine2"></div>
        <div class="sliderWrap"><div class="limTick"></div>
          <input type="range" min="0" max="100" step="1" id="cLim" class="chgSlider"></div>
        <div class="ampRow"><button id="ampDn">‹</button><span id="cAmp">-</span><button id="ampUp">›</button></div>
        <div class="chgBtns" id="chgBtns">
          <button id="btnStopChg">Stop Charging</button>
          <button id="btnUnlockPort">Unlock Charge Port</button>
        </div>
      </div>
    </div>
    </div>
  </div>

  <div class="ftr">
    <span id="odo">-</span>
    <span id="upd">-</span>
  </div>
  ${(this._config && this._config.preview) ? `<div class="pvw" id="pvw">${
      PREVIEWS.map(([k, label]) =>
        `<button data-pv="${k}" class="${(this._preview || "off") === k ? "on" : ""}">${esc(label)}</button>`
      ).join("")}</div>
  <div class="pvwNote">Preview only: this fakes what the card READS, for ${esc(car.name || "this car")} on this dashboard. No commands are sent and the car is not touched. Remove <b>preview: true</b> to hide this.</div>` : ""}
</ha-card>`;

      let carHtml = this._carSvg();
      if (this._view === "map")
        carHtml += '<button class="backBtn mapBack" id="ctlBack" title="Back to ' +
          esc(car.name || "the car") + '">' +
          '<span class="bch">\u2039</span>Back</button>';
      else if (this._view === "ctl" && this._img("image_side"))
        carHtml += '<button class="backBtn" id="ctlBack" title="Back">\u2039</button>';
      this.shadowRoot.getElementById("carBox").innerHTML = carHtml;
      requestAnimationFrame(() => this._positionRestFrunkHit());

      if (this._view === "clim") {
        const climateBack = this.shadowRoot.getElementById("ctlBack");
        const cardRoot = this.shadowRoot.querySelector("ha-card");
        if (climateBack && cardRoot) cardRoot.appendChild(climateBack);
      }
      this.shadowRoot.querySelectorAll("img").forEach((img) => {
        img.addEventListener("load", () => requestAnimationFrame(() => { this._positionRestFrunkHit(); this._positionClimateLayout(); this._updateClimateCable(); }));
        img.addEventListener("error", () => {
          const failedSrc = img.currentSrc || img.src;
          if (/\.png(?:[?#]|$)/i.test(failedSrc)) {
            img.src = failedSrc.replace(/\.png(?=([?#]|$))/i, ".jpg");
          } else if (/climate3\.jpg(?:[?#]|$)/i.test(failedSrc)) {
            const base = this._imgBase();
            if (base) img.src = base.replace(/\/$/, "") + "/climate.png?v=1";
          }
        });
      });
      const climateImg = this.shadowRoot.querySelector(".climWrap img.climImg");
      this._buildCarMenu();
      this._wire();
      if (this._view === "map") this._mountMap();
      const ci = this._img("image_climate");
      if (ci) this._carBox(ci, "Clim");
      if (ci && this._climPreloadUrl !== ci) {
        this._climPreloadUrl = ci;
        this._climPreloaded = false;
        this._climPreloadSettled = false;
        const loadImage = (src) => new Promise((resolve) => {
          const pimg = new Image();
          let finished = false;
          const finish = (ok) => { if (finished) return; finished = true; resolve(ok); };
          pimg.onload = () => {
            if (typeof pimg.decode === "function") pimg.decode().then(() => finish(true), () => finish(true));
            else finish(true);
          };
          pimg.onerror = () => finish(false);
          pimg.src = src;
          if (pimg.complete) queueMicrotask(() => finish(pimg.naturalWidth > 0));
        });
        this._climPreloadPromise = (async () => {
          let ready = await loadImage(ci);
          if (!ready && /climate3\.(?:jpg|png)(?:\?|$)/.test(ci) && this._imgBase()) {
            const base = this._imgBase().replace(/\/$/, "");
            const fallbacks = [ci.replace(/\.png(?=([?#]|$))/i, ".jpg"), base + "/climate.png?v=1", base + "/climate.jpg?v=1"];
            for (const fallback of fallbacks) {
              if (fallback === ci) continue;
              ready = await loadImage(fallback);
              if (ready) break;
            }
          }
          this._climPreloaded = ready;
          this._climPreloadSettled = true;
          return ready;
        })();
      }
    }

    _wire() {
      const q = (id) => this.shadowRoot.getElementById(id);
      const pvw = q("pvw");
      if (pvw) pvw.querySelectorAll("[data-pv]").forEach((b) =>
        b.addEventListener("click", () => {
          const v = b.dataset.pv;
          this._preview = (v === "off") ? null : v;
          this._built = false;
          if (this._hass) { this._build(); this._update(); }
        }));
      q("btnRefresh").addEventListener("click", () => {
        this._call("button", "press", { entity_id: this._car._entities.refresh });
        q("btnRefresh").classList.add("spin");
        setTimeout(() => { const b = q("btnRefresh"); if (b) b.classList.remove("spin"); }, 4000);
      });

      // action row: require a second tap before sending car commands.
      q("aFlash").addEventListener("click", () => {
        if (this._confirm("flash", q("aFlash"), "Flash")) {
          this._call("button", "press", { entity_id: this._car._entities.flash });
          this._playFlashEffect();
        }
      });
      q("aHonk").addEventListener("click", () => {
        if (this._confirm("honk", q("aHonk"), "Honk")) {
          this._call("button", "press", { entity_id: this._car._entities.horn });
          this._playHornEffect();
        }
      });
      q("aStart").addEventListener("click", () => {
        if (this._confirm("start", q("aStart"), "Start")) this._call("button", "press", { entity_id: this._car._entities.remote_start });
      });
      q("aVent").addEventListener("click", () => {
        if (this._confirm("vent", q("aVent"), "Vent")) this._setWindowsVent();
      });
      q("aPort").addEventListener("click", () => {
        if (this._confirm("port", q("aPort"), "Port")) this._toggleCover("charge_port");
      });
      q("aSentry").addEventListener("click", () => {
        if (!this._confirm("sentry", q("aSentry"), "Sentry")) return;
        const sentry = this._st("sentry");
        if (sentry) this._call("switch", sentry.state === "on" ? "turn_off" : "turn_on", { entity_id: sentry.entity_id });
      });

      q("aLock").addEventListener("click", () => {
        const btn = q("aLock");
        const currentState = this._is("lock", "locked") ? "locked"
          : this._is("lock", "unlocked") ? "unlocked" : "";
        if (!currentState) return;
        if (!this._arm.mainLock) {
          this._arm.mainLock = true;
          this._arm.mainLockState = currentState;
          btn.classList.add("armed");
          btn.querySelector(".lb").textContent = currentState === "locked" ? "Unlock?" : "Lock?";
          btn.setAttribute("aria-label", currentState === "locked" ? "Unlock?" : "Lock?");
          clearTimeout(this._armT.mainLock);
          this._armT.mainLock = setTimeout(() => {
            this._arm.mainLock = false;
            delete this._arm.mainLockState;
            btn.classList.remove("armed");
            this._update();
          }, 3000);
          return;
        }
        const confirmed = this._is("lock", this._arm.mainLockState);
        this._arm.mainLock = false;
        delete this._arm.mainLockState;
        clearTimeout(this._armT.mainLock);
        btn.classList.remove("armed");
        if (confirmed) this._toggleLock();
        else this._update();
      });

      // resting view (no longer navigates to top-down)
      if (this._view === "clim") requestAnimationFrame(() => { this._positionClimateLayout(); this._placeBack(); this._updateClimateCable(); });
      const backB = q("ctlBack");
      if (backB) backB.addEventListener("click", () => this._setView(""));

      // rest overlay buttons (frunk/trunk/lock on side image)
      const rFrunkHit = this.shadowRoot.getElementById("restFrunkHitButton");
      const rFrunk = this.shadowRoot.getElementById("restFrunkBtn");
      const handleRestFrunkClick = (e) => {
        e.stopPropagation();
        const lbl = this.shadowRoot.getElementById("restFrunkLbl");
        if (!this._arm.rfrunk) {
          this._arm.rfrunk = true;
          if (rFrunk) rFrunk.classList.add("armed");
          if (lbl) lbl.textContent = "Tap again";
          clearTimeout(this._armT.rfrunk);
          this._armT.rfrunk = setTimeout(() => { this._arm.rfrunk = false; if (rFrunk) rFrunk.classList.remove("armed"); this._update(); }, 3000);
          return;
        }
        this._arm.rfrunk = false;
        if (rFrunk) rFrunk.classList.remove("armed");
        clearTimeout(this._armT.rfrunk);
        this._toggleCover("frunk");
      };
      if (rFrunk) rFrunk.addEventListener("click", handleRestFrunkClick);
      if (rFrunkHit) rFrunkHit.addEventListener("click", handleRestFrunkClick);
      const rTrunk = this.shadowRoot.getElementById("restTrunkBtn");
      if (rTrunk) rTrunk.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this._car.force_trunk_open === true) return;
        const lbl = this.shadowRoot.getElementById("restTrunkLbl");
        if (!this._arm.rtrunk) {
          this._arm.rtrunk = true; rTrunk.classList.add("armed");
          if (lbl) lbl.textContent = "Tap again";
          clearTimeout(this._armT.rtrunk);
          this._armT.rtrunk = setTimeout(() => { this._arm.rtrunk = false; rTrunk.classList.remove("armed"); this._update(); }, 3000);
          return;
        }
        this._arm.rtrunk = false; rTrunk.classList.remove("armed"); clearTimeout(this._armT.rtrunk);
        this._toggleCover("trunk");
      });

      // on-car taps (top-down view, still used when no side image exists)
      const frunkG = this.shadowRoot.getElementById("frunkTap");
      const trunkG = this.shadowRoot.getElementById("trunkTap");

      if (frunkG) frunkG.addEventListener("click", () => {
        if (this._car.force_frunk_open === true) return;
        const lbl = this.shadowRoot.getElementById("frunkLbl");
        if (!this._arm.frunk) {
          this._arm.frunk = true; frunkG.classList.add("armed");
          lbl.textContent = "Tap again";
          clearTimeout(this._armT.frunk);
          this._armT.frunk = setTimeout(() => { this._arm.frunk = false; frunkG.classList.remove("armed"); this._update(); }, 3000);
          return;
        }
        this._arm.frunk = false; frunkG.classList.remove("armed"); clearTimeout(this._armT.frunk);
        this._toggleCover("frunk");
      });
      if (trunkG) trunkG.addEventListener("click", () => {
        if (this._car.force_trunk_open === true) return;
        const lbl = this.shadowRoot.getElementById("trunkLbl");
        if (!this._arm.trunk) {
          this._arm.trunk = true; trunkG.classList.add("armed");
          lbl.textContent = "Tap again";
          clearTimeout(this._armT.trunk);
          this._armT.trunk = setTimeout(() => { this._arm.trunk = false; trunkG.classList.remove("armed"); this._update(); }, 3000);
          return;
        }
        this._arm.trunk = false; trunkG.classList.remove("armed"); clearTimeout(this._armT.trunk);
        this._toggleCover("trunk");
      });

      // rows
      const toggleRow = (rowId) => {
        const row = this.shadowRoot.getElementById(rowId);
        row.classList.toggle("open");
        this._openRows[rowId] = row.classList.contains("open");
      };
      q("headClim").addEventListener("click", () => this._setView("clim"));
      q("headChg").addEventListener("click", () => toggleRow("rowChg"));
      // Location row removed

      // climate controls
      const cpwr = q("climPwr");
      if (cpwr) cpwr.addEventListener("click", (e) => { e.stopPropagation(); this._toggleClimate(); });
      const cvent = q("climVent");
      if (cvent) cvent.addEventListener("click", () => this._setWindowsVent());
      // no rear-centre seat heater in any Tesla - seatRC removed globally (Nick, 2026-08-31)
      const SEATS = [["seatFL","seat_fl"],["seatFR","seat_fr"],["seatRL","seat_rl"],["seatRR","seat_rr"]];
      const AP = this._climAnchors();
      const SEAT_POS = { seatFL: AP.fl, seatFR: AP.fr, seatRL: AP.rl, seatRC: AP.rc, seatRR: AP.rr, wheelHeat: AP.wheel };
      const showToast = (id, label) => {
        const g = q("heatToast");
        if (!g) return;
        const [sx, sy] = SEAT_POS[id];
        const txt = q("heatToastTxt"), bg = q("heatToastBg");
        txt.textContent = label;
        const w = label.length * 7.6 + 18;
        const tx = Math.min(360 - w - 4, Math.max(4, sx - w / 2));
        const ty = Math.min(600 - 30, sy + 24);
        bg.setAttribute("x", tx); bg.setAttribute("y", ty); bg.setAttribute("width", w);
        txt.setAttribute("x", tx + 9); txt.setAttribute("y", ty + 17);
        g.style.display = "";
        clearTimeout(this._toastT);
        this._toastT = setTimeout(() => { const gg = q("heatToast"); if (gg) gg.style.display = "none"; }, 1600);
      };
      const cycleSeat = (id, key) => {
        if ((this._car.hide_seats || []).includes(id.slice(4).toLowerCase())) return;
        const s = this._st(key);
        if (!s) return;
        // Build the tap cycle from the options the integration actually offers,
        // preserving each option's exact spelling for the service call.
        // tesla_custom: Off/Auto/High/Medium/Low - tesla_fleet: off/low/medium/high
        // - ventilated-seat cars: Off/Heat Low/Heat Medium/Heat High/Auto/Cool….
        const avail = Array.isArray(s.attributes.options) && s.attributes.options.length
          ? s.attributes.options : ["Off", "Auto", "High", "Medium", "Low"];
        const find = (name) => avail.find((o) => {
          const l = o.toLowerCase();
          return l === name || l === "heat " + name;
        }) || null;
        const order = ["off", "auto", "high", "medium", "low"].map(find).filter(Boolean);
        if (!order.length) return;
        const pend = this._pendSeat && this._pendSeat.key === key && Date.now() - this._pendSeat.ts < 12000
          ? this._pendSeat.val : null;
        const base = (pend || s.state || "").toLowerCase();
        let i = order.findIndex((o) => o.toLowerCase() === base);
        const next = order[(i + 1) % order.length];
        this._pendSeat = { key, val: next, ts: Date.now() };
        const lbl = next.toLowerCase().replace(/^heat /, "");
        showToast(id, "Heat " + lbl.charAt(0).toUpperCase() + lbl.slice(1));
        this._call("select", "select_option", { entity_id: s.entity_id, option: next });
        this._update();
      };
      SEATS.forEach(([id, key]) => {
        const g = q(id);
        if (g) g.addEventListener("click", () => cycleSeat(id, key));
      });
      const whG = q("wheelHeat");
      if (whG) whG.addEventListener("click", () => {
        const s = this._steerEnt();
        if (!s) return;
        if (s.entity_id.startsWith("select.")) {
          /* step Off -> Low -> High -> Off using the car's own option order.
             Auto is skipped in the cycle: tapping out of Auto goes to the
             first real level, which is what the app does when you set a level
             by hand. Two heat steps on a real car, so the cycle is short. */
          const avail = (s.attributes.options || []).filter((o) => String(o).toLowerCase() !== "auto");
          if (!avail.length) return;
          const cur = String(s.state).toLowerCase();
          const i = avail.findIndex((o) => String(o).toLowerCase() === cur);
          const next = i < 0
            ? (avail.find((o) => String(o).toLowerCase() !== "off") || avail[0])
            : avail[(i + 1) % avail.length];
          this._call("select", "select_option", { entity_id: s.entity_id, option: next });
        } else {                                          // switch-only cars, eg the Model Y
          this._call("switch", s.state === "on" ? "turn_off" : "turn_on", { entity_id: s.entity_id });
        }
      });
      const dfBtn = q("btnDefrost");
      if (dfBtn) dfBtn.addEventListener("click", () => {
        /* decide from the same source that lights the button, so a stale
           preset_mode can't make the first press send the opposite command */
        const want = !this._defrostOn();
        const ds = this._st("defrost_switch");
        if (ds) {                                         // tesla_fleet: a real defrost switch
          this._call("switch", want ? "turn_on" : "turn_off", { entity_id: ds.entity_id });
          this._setPend("defrost", want);
          return;
        }
        const cs = this._st("climate");                   // tesla_custom: climate preset
        if (!cs) return;
        /* the app switches the climate on when you start defrosting; without
           this the HVAC can sit "off" and the card cannot tell a real defrost
           from a stale preset once the optimistic window closes */
        if (want && cs.state === "off")
          this._call("climate", "set_hvac_mode", { entity_id: cs.entity_id, hvac_mode: "heat_cool" });
        this._call("climate", "set_preset_mode", { entity_id: cs.entity_id, preset_mode: want ? "defrost" : "normal" });
        this._setPend("defrost", want);
      });
      const tU = q("tUp"), tD = q("tDn");
      if (tU) tU.addEventListener("click", () => this._bumpTemp(0.5));
      if (tD) tD.addEventListener("click", () => this._bumpTemp(-0.5));

      // extra climate controls (present only in the clim view, per capability)
      const setPreset = (mode) => {
        const cs2 = this._st("climate");
        if (!cs2) return;
        const presets = cs2.attributes.preset_modes || [];
        const back = presets.find((p) => String(p).toLowerCase() === "normal") ||
                     presets.find((p) => String(p).toLowerCase() === "off") || presets[0];
        const cur = (this._pendPreset && Date.now() - this._pendPreset.ts < 20000)
          ? this._pendPreset.val : cs2.attributes.preset_mode;
        const target = String(cur).toLowerCase() === mode
          ? back : presets.find((p) => String(p).toLowerCase() === mode);
        if (!target) return;
        this._pendPreset = { val: target, ts: Date.now() };
        this._call("climate", "set_preset_mode", { entity_id: cs2.entity_id, preset_mode: target });
        this._update();
      };
      const bioB = q("btnBio");
      if (bioB) bioB.addEventListener("click", () => {
        const cs2 = this._st("climate");
        if (!cs2) return;
        const fans = cs2.attributes.fan_modes || [];
        const bio = fans.find((f) => String(f).toLowerCase() === "bioweapon");
        const off = fans.find((f) => String(f).toLowerCase() === "off") || fans[0];
        const cur = (this._pendFan && Date.now() - this._pendFan.ts < 20000)
          ? this._pendFan.val : cs2.attributes.fan_mode;
        const target = String(cur).toLowerCase() === "bioweapon" ? off : bio;
        if (!target) return;
        this._pendFan = { val: target, ts: Date.now() };
        this._call("climate", "set_fan_mode", { entity_id: cs2.entity_id, fan_mode: target });
        this._update();
      });
      const campB = q("btnCamp");
      if (campB) campB.addEventListener("click", () => setPreset("camp"));
      const petB = q("btnPet");
      if (petB) petB.addEventListener("click", () => setPreset("dog"));
      const copSeg = q("copSeg");
      if (copSeg) copSeg.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => {
          const cop = this._st("cop");
          if (!cop) return;
          this._pendCop = { val: b.dataset.cop, ts: Date.now() };
          if (cop.entity_id.startsWith("select."))
            this._call("select", "select_option", { entity_id: cop.entity_id, option: b.dataset.cop });
          else
            this._call("climate", "set_hvac_mode", { entity_id: cop.entity_id, hvac_mode: b.dataset.cop });
          this._update();
        }));

      // charging controls
      const snapLim = (v) => {
        v = Math.max(50, Math.round(v));      // Tesla's floor is 50%
        if (v >= 76 && v <= 84) v = 80;       // click-stop at the recommended daily limit
        return v;
      };
      q("cLim").addEventListener("pointerdown", () => { this._limDrag = true; });
      q("cLim").addEventListener("change", (e) => {
        if (this._car.force_plugged === true) return;
        this._limDrag = false;
        const v = snapLim(+e.target.value);
        e.target.value = v;
        q("cLimVal").textContent = v + "%";
        this._call("number", "set_value", { entity_id: this._car._entities.charge_limit, value: v });
      });
      q("cLim").addEventListener("input", (e) => {
        this._limDrag = true;
        q("cLimVal").textContent = snapLim(+e.target.value) + "%";
      });
      q("ampUp").addEventListener("click", () => this._bumpAmps(1));
      const stopB = q("btnStopChg");
      if (stopB) stopB.addEventListener("click", () => {
        if (this._car.force_plugged === true) return;
        this._call("switch", "turn_off", { entity_id: this._car._entities.charger_switch });
      });
      const unlockB = q("btnUnlockPort");
      if (unlockB) unlockB.addEventListener("click", () => {
        if (this._car.force_plugged === true) return;
        const closing = unlockB.dataset.mode === "close";
        const cableLock = closing ? null : this._st("charge_cable_lock");
        const portCover = this._st("charge_port");
        const target = closing ? portCover : (cableLock || portCover);
        if (!target) return;
        const title = closing ? "Close Charge Port" : "Unlock Charge Port";
        const prompt = closing ? "Close?" : "Unlock?";
        const confirmKey = closing ? "closeChargePort" : "unlockChargePort";
        if (!this._confirm(confirmKey, unlockB, title, prompt)) return;
        if (closing) {
          this._call("cover", "close_cover", { entity_id: target.entity_id });
        } else if (cableLock) {
          this._call("lock", "unlock", { entity_id: target.entity_id });
        } else {
          this._call("cover", "open_cover", { entity_id: target.entity_id });
        }
      });
      q("ampDn").addEventListener("click", () => this._bumpAmps(-1));

      // calibration mode: tap any overlay to read overlay-space coordinates
      if (this._car.calibrate) {
        this.shadowRoot.querySelectorAll("svg.ovl").forEach((svg) => {
          svg.addEventListener("click", (e) => {
            const vb = (svg.getAttribute("viewBox") || "0 0 360 600").split(/\s+/).map(Number);
            const r = svg.getBoundingClientRect();
            const x = Math.round(vb[0] + ((e.clientX - r.left) / r.width) * vb[2]);
            const y = Math.round(vb[1] + ((e.clientY - r.top) / r.height) * vb[3]);
            const out = this.shadowRoot.getElementById("calibOut");
            if (out) out.textContent = x + "," + y;
            console.info("tesla-fleet-card calibrate:", x + "," + y);
          }, true);
        });
      }

      // restore open rows across rebuilds
      Object.keys(this._openRows).forEach((rid) => {
        if (this._openRows[rid]) {
          const row = this.shadowRoot.getElementById(rid);
          if (row) row.classList.add("open");
        }
      });
    }

    _buildCarMenu() {
      const q = (id) => this.shadowRoot.getElementById(id);
      const menu = q("carMenu");
      const btn = q("nmBtn");
      if (this._cars.length < 2) return;
      menu.innerHTML = this._cars
        .map((c, i) =>
          '<button data-i="' + i + '"><span class="dot" style="background:' +
            (PAINT_COLORS[String(c.paint || "").toLowerCase()] || "#f2f3f5") + '"></span>' +
          c.name + (c.model ? ' <span style="color:#8f8f8f;font-size:12px">' + c.model + "</span>" : "") +
          (i === this._sel ? " ✓" : "") + "</button>")
        .join("");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
      });
      menu.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          this._selectCar(parseInt(b.dataset.i, 10));
        });
      });
      document.addEventListener("click", () => { if (menu && !menu.hidden) menu.hidden = true; });
    }

    _bumpAmps(d) {
      if (this._car.force_plugged === true) return;
      const s = this._st("charging_amps");
      if (!s) return;
      const min = s.attributes.min || 5, max = s.attributes.max || 32;
      const v = Math.min(max, Math.max(min, (parseFloat(s.state) || 16) + d));
      this._call("number", "set_value", { entity_id: s.entity_id, value: v });
    }
    _bumpTemp(d) {
      const s = this._st("climate");
      if (!s) return;
      const cur = s.attributes.temperature || 20;
      this._call("climate", "set_temperature", { entity_id: s.entity_id, temperature: Math.round((cur + d) * 2) / 2 });
    }
    _toggleLock() {
      const s = this._st("lock");
      if (!s) return;
      const locked = this._is("lock", "locked");
      const targetState = locked ? "unlocked" : "locked";
      this._call("lock", locked ? "unlock" : "lock", { entity_id: s.entity_id });
      if (!this._opt) this._opt = {};
      this._opt["lock"] = { state: targetState, expires: Date.now() + 5000 };
      setTimeout(() => this._update(), 5000);
      this._update();
    }
    /* Switching the climate off ends defrost in the app. Dropping our
       assumption isn't enough: the real preset_mode still reads "defrost" for a
       poll cycle, so the glass would stay lit. Assert defrost-off instead, the
       same way the Defrost button asserts defrost-on. */
    _toggleClimate() {
      const s = this._st("climate");
      if (!s) return;
      // tesla_custom's climate entity doesn't support climate.turn_on/turn_off -
      // set_hvac_mode works everywhere.
      const modes = s.attributes.hvac_modes || [];
      const turningOn = this._climOn() === false;
      if (turningOn) {
        const on = modes.find((m) => m === "heat_cool") || modes.find((m) => m && m !== "off") || "heat_cool";
        this._call("climate", "set_hvac_mode", { entity_id: s.entity_id, hvac_mode: on });
      } else {
        this._call("climate", "set_hvac_mode", { entity_id: s.entity_id, hvac_mode: "off" });
      }
      // optimistic: Tesla's state echo is slow - show the intent immediately
      if (turningOn) { if (this._pend) delete this._pend.defrost; }
      else this._setPend("defrost", false);
      this._setPend("clim", turningOn);
    }
    _climOn() {
      const want = this._pendVal("clim");
      const real = this._climReal();
      if (want === undefined) return real;
      if (real === want) { delete this._pend.clim; return real; }
      return want;
    }
    _climReal() {
      const s = this._st("climate");
      return !!s && s.state !== "off" && s.state !== "unavailable";
    }
    _toggleCover(key) {
      if ((key === "trunk" && this._car.force_trunk_open === true) ||
          (key === "charge_port" && this._car.force_plugged === true)) return;
      const s = this._st(key);
      if (!s) return;
      const targetState = s.state === "open" ? "closed" : "open";
      this._call("cover", s.state === "open" ? "close_cover" : "open_cover", { entity_id: s.entity_id });
      if (!this._opt) this._opt = {};
      this._opt[key] = { state: targetState, expires: Date.now() + 5000 };
      setTimeout(() => this._update(), 5000);
      this._update();
    }

    _setWindowsVent() {
      const cover = this._st("windows_cover");
      if (cover) this._call("cover", "open_cover", { entity_id: cover.entity_id });
      if (!this._opt) this._opt = {};
      this._opt.windows_cover = { state: "open", expires: Date.now() + 15000 };
      this._update();
    }

    _flashEffectAllowed() {
      if (this._visualPlugged() || this._charging() || this._forceDriveAnim()) return false;
      const shiftState = String((this._st("shift") || {}).state || "").trim().toLowerCase();
      if (["d", "r", "n", "drive", "reverse", "neutral"].includes(shiftState) || this._lunaShiftDriving()) return false;
      const speedEntity = (this._car.speed_entity && this._hass && this._hass.states[this._car.speed_entity]) || this._st("speed");
      const reportedSpeed = speedEntity ? parseFloat(speedEntity.state) : NaN;
      return (Number(this._speedKph()) || 0) <= 1 && !(Number.isFinite(reportedSpeed) && reportedSpeed > 1);
    }
    _playFlashEffect() {
      if (!this._flashEffectAllowed()) return;
      this._flashUntil = Date.now() + 2000;
      const headlights = this.shadowRoot && this.shadowRoot.getElementById("headlights");
      if (headlights) headlights.style.display = "";
      clearTimeout(this._flashTimer);
      this._flashTimer = setTimeout(() => { this._flashUntil = 0; this._flashTimer = null; this._update(); }, 2000);
    }

    _playHornEffect() {
      const ripple = this.shadowRoot && this.shadowRoot.getElementById("hornRipple");
      if (!ripple) return;
      ripple.style.display = "";
      ripple.querySelectorAll("animate").forEach((animation) => { try { animation.beginElement(); } catch (_) {} });
      clearTimeout(this._hornTimer);
      this._hornTimer = setTimeout(() => { ripple.style.display = "none"; this._hornTimer = null; }, 1800);
    }

    _lunaShiftDriving() {
      const shift = this._st("shift");
      if (!shift || shift.entity_id !== "sensor.luna_lupa_shift_state") return false;
      const state = String(shift.state || "").trim().toLowerCase();
      return state !== "p" && state !== "park" && state !== "unavailable" && state !== "unknown";
    }

    _forceDriveAnim() {
      return this._car.force_drive_anim === true || this._lunaShiftDriving();
    }

    _resting() {
      if (this._view === "ctl" || this._view === "clim") return false;
      // resting view only with a real photo - imageless cars open on the
      // top-down (drawn ¾ resting art removed for good, 2026-08-31)
      return !!this._img("image_side");
    }

    _carRest() {
      const car = this._car;
      const forceDrive = this._forceDriveAnim();
      const chg = !forceDrive && this._hass ? this._charging() : false;
      const plg = !forceDrive && this._visualPlugged();
      const src = (chg && this._img("image_charging")) ||
                  (plg && (this._img("image_side_plugged") || this._img("image_charging"))) ||
                  this._img("image_side");
      /* the three pack variants are different camera angles, so the glass trace
         has to follow whichever photo we just chose */
      const rSfx = (chg && this._img("image_charging")) ? "RestCharging"
                 : (plg && this._img("image_side_plugged")) ? "RestPlugged"
                 : (plg && this._img("image_charging")) ? "RestCharging" : "Rest";
      const baked = this._cableBaked();
      // Baked pack photos already show the cable (green while charging) -
      // no overlay at all. The drawn overlay exists only for users whose own
      // photos have no cable in them.
      let RA = this._car.rest_anchors || {};
      let defF = [35, 38, 35, 18], defT = [215, 60, 215, 40];
      if (rSfx === "Rest") {
        RA = this._car.rest_anchors_unplugged || RA;
        defF = [70, 75, 70, 55];
        defT = [200, 30, 200, 10];
      }
      const fA = anchor(RA, "frunk", defF);
      const fkx = fA[0], fky = fA[1], ftx = fA.length > 2 ? fA[2] : fA[0], fty = fA.length > 2 ? fA[3] : fA[1] - 20;
      const tA = anchor(RA, "trunk", defT);
      const tkx = tA[0], tky = tA[1], ttx = tA.length > 2 ? tA[2] : tA[0], tty = tA.length > 2 ? tA[3] : tA[1] - 20;

      const cA = RA.charger || null;
      let chargerBtn = "";

      const restHotspots = `
  <svg class="car ovl restHotspotsOverlay" id="restHotspotsOvl" viewBox="0 0 233 108" style="pointer-events:none">
    <g class="restOvlBtn" id="restFrunkBtn" style="pointer-events:auto">
      <line x1="${fkx}" y1="${fky}" x2="${ftx}" y2="${fty}" />
      <circle class="rDot" cx="${fkx}" cy="${fky}" />
      <text id="restFrunkLbl" class="rLbl" x="${ftx}" y="${fty - 3}" text-anchor="middle">Frunk</text>
      <rect id="restFrunkHitBounds" x="${ftx - 15}" y="${fty - 15}" width="30" height="20" fill="transparent" />
    </g>
    <g class="restOvlBtn" id="restTrunkBtn" style="pointer-events:auto">
      <line x1="${tkx}" y1="${tky}" x2="${ttx}" y2="${tty}" />
      <circle class="rDot" cx="${tkx}" cy="${tky}" />
      <text id="restTrunkLbl" class="rLbl" x="${ttx}" y="${tty - 3}" text-anchor="middle">Trunk</text>
      <rect x="${ttx - 15}" y="${tty - 15}" width="30" height="20" fill="transparent" />
    </g>

    ${chargerBtn}
  </svg>
  </svg>`;

      const pxy = this._portXY("port_xy");
      const [px, py] = pxy.split(",").map(Number);
      const cable = this._car.cable_path ||
        `M ${px - 43} 108 C ${px - 19} 103 ${px - 7} 76 ${px} ${py + 1}`;
      const boltPath = baked ? (this._bakedCablePath() || cable) : cable;
      const cableEndMatch = String(boltPath).match(/(-?(?:\d+\.?\d*|\.\d+))\s+(-?(?:\d+\.?\d*|\.\d+))\s*$/);
      const cableEndX = cableEndMatch ? Number(cableEndMatch[1]) : px;
      const cableEndY = cableEndMatch ? Number(cableEndMatch[2]) : py + 1;
      const boltPathD = `M ${cableEndX - 4} ${cableEndY - 12} l -3.5 5 h 2.5 l -1.5 5.5 5.5 -8 h -3 l 1.5 -2.5 z`;
      const box = this._carBox(src, rSfx);
      const lPos = this._car.lights || null;
      const lLeds = this._car.light_leds || [];
      let lightsArr = [];
      if (lPos && Array.isArray(lPos) && lPos.length > 0) {
        if (Array.isArray(lPos[0])) lightsArr = lPos;
        else lightsArr = [lPos];
      } else {
        const lx = box && box.length === 4 ? box[0] + (box[2]-box[0])*0.1 : 25;
        const ly = box && box.length === 4 ? box[1] + (box[3]-box[1])*0.65 : 72;
        lightsArr = [[lx, ly]];
      }
      let ledsArr = [];
      if (lLeds && Array.isArray(lLeds) && lLeds.length > 0) {
        if (Array.isArray(lLeds[0])) ledsArr = lLeds;
        else ledsArr = [lLeds];
      }
      const ledLines = ledsArr.filter((l) => Array.isArray(l) && l.length >= 4 && l.slice(0, 4).every((n) => Number.isFinite(Number(n))) && Number(l[0]) >= 0 && Number(l[0]) <= 233 && Number(l[2]) >= 0 && Number(l[2]) <= 233 && Number(l[1]) >= 0 && Number(l[1]) <= 108 && Number(l[3]) >= 0 && Number(l[3]) <= 108 && Number(l[4] || 1.5) <= 8);
      const dayConfig = Array.isArray(car.daylight_points) ? car.daylight_points : [];
      const dayPointSets = dayConfig.length && Array.isArray(dayConfig[0]) && Array.isArray(dayConfig[0][0]) ? dayConfig : [dayConfig];
      let ledPaths = dayPointSets.map((points) => {
        const p = points.filter((pt) => Array.isArray(pt) && pt.length >= 2 && Number.isFinite(Number(pt[0])) && Number.isFinite(Number(pt[1])) && Number(pt[0]) >= 0 && Number(pt[0]) <= 233 && Number(pt[1]) >= 0 && Number(pt[1]) <= 108);
        if (p.length < 2) return null;
        let d = `M ${p[0][0]} ${p[0][1]} `;
        for (let i = 1; i < p.length - 1; i++) {
          const xc = (Number(p[i][0]) + Number(p[i + 1][0])) / 2;
          const yc = (Number(p[i][1]) + Number(p[i + 1][1])) / 2;
          d += `Q ${p[i][0]} ${p[i][1]} ${xc} ${yc} `;
        }
        const last = p[p.length - 1];
        d += p.length > 2 ? `L ${last[0]} ${last[1]}` : `L ${p[1][0]} ${p[1][1]}`;
        return d;
      }).filter(Boolean);
      if (!ledPaths.length) {
        ledPaths = ledLines.length ? ledLines.map((l) => `M ${l[0]} ${l[1]} L ${l[2]} ${l[3]}`) : ["M 49 78 C 58 76 68 73 79 73", "M 2 57 C 6 60 10 63 12 65"];
      }
            const ledWidth = Math.max(0.2, Math.min(8, Number(car.daylight_thickness) || 1.15));
      const ledIntensity = Math.max(0, Math.min(1, Number.isFinite(Number(car.daylight_intensity)) ? Number(car.daylight_intensity) : 0.9));
      const ledCustomSvg = ledPaths.map((d) => `<path d="${d}" fill="none" stroke="#dceaff" stroke-width="${ledWidth * 3.2}" stroke-linecap="round" stroke-linejoin="round" opacity="${ledIntensity * 0.26}" filter="url(#headlightSoft)"/><path d="${d}" fill="none" stroke="#f4f8ff" stroke-width="${ledWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${ledIntensity}"/>`).join("");
      const starSize = Math.max(0.2, Math.min(12, Number(car.light_star_size) || 3.2));
      const starIntensity = Math.max(0, Math.min(1, Number.isFinite(Number(car.light_star_intensity)) ? Number(car.light_star_intensity) : 0.9));
      const spotWidth = Math.max(0.2, Math.min(20, Number(car.light_spot_width) || 2.8));
      const spotHeight = Math.max(0.2, Math.min(12, Number(car.light_spot_height) || 1.4));
      const spotIntensity = Math.max(0, Math.min(1, Number.isFinite(Number(car.light_spot_intensity)) ? Number(car.light_spot_intensity) : 0.82));
      const [frunkFxX, frunkFxY] = fA;
      const interactiveFxSvg = `
        <g id="hornRipple" style="display:none;pointer-events:none" fill="none" stroke="#f4f7ff" stroke-width="1.1">
          <circle cx="${frunkFxX}" cy="${frunkFxY}" r="1" opacity="0"><animate attributeName="r" from="1" to="11" dur=".8s" begin="indefinite"/><animate attributeName="opacity" values=".95;0" dur=".8s" begin="indefinite"/></circle>
          <circle cx="${frunkFxX}" cy="${frunkFxY}" r="1" opacity="0"><animate attributeName="r" from="1" to="11" dur=".8s" begin="indefinite"/><animate attributeName="opacity" values=".8;0" dur=".8s" begin="indefinite"/></circle>
        </g>`;
      const headlightSvg = `<g id="headlights" style="display:${forceDrive ? '' : 'none'}">
        ${lightsArr.map((l) => {
          const x = Number(l[0]), y = Number(l[1]);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return "";
          const defaultAngle = Number.isFinite(Number(car.light_angle)) ? Number(car.light_angle) : 28;
          const angle = Number.isFinite(Number(l[3])) ? Number(l[3]) : defaultAngle;
          const wrappedAngle = ((angle % 360) + 360) % 360;
          const angleRad = (wrappedAngle > 180 ? wrappedAngle - 360 : wrappedAngle) * Math.PI / 180;
          const len = Math.max(8, Math.min(360, Number(l[4]) || Number(car.light_beam_length) || 82));
          const half = Math.max(1, Math.min(120, Number(l[5]) || Number(car.light_beam_width) || 16));
          const sourceW = Math.max(1, Math.min(60, Number(l[6]) || Number(car.light_source_size) || 7));
          const sourceH = Math.max(0.7, Math.min(36, Number(l[7]) || Number(car.light_source_thickness) || 3.5));
          // Positive angle points down from the car's forward (left) direction.
          // Compensate for stretching the overlay over the side photo.
          const ex = x - len, ey = y + len * Math.tan(angleRad) * 0.765;
          const nx = Math.sin(angleRad), ny = Math.cos(angleRad) * 0.765;
          const ox = nx * half, oy = ny * half;
          const passengerLamp = x < 35;
          const roadBeam = `<g>
            <path d="M ${x} ${y} L ${ex+ox} ${ey+oy} Q ${ex-5} ${ey+2} ${ex-ox} ${ey-oy} Z" fill="url(#headlightBeam)" filter="url(#headlightSoft)"/>
            <ellipse cx="${Math.max(0, ex-5)}" cy="${Math.min(108, ey+2)}" rx="${half*2.7}" ry="${half*0.9}" fill="url(#headlightPool)" filter="url(#headlightSoft)"/>
          </g>`;
          const flare = passengerLamp
            ? `<ellipse cx="${x}" cy="${y}" rx="${Math.max(starSize * 3.2, Math.min(sourceW, starSize * 5.5))}" ry="${Math.max(starSize * 1.7, Math.min(sourceH * 0.65, starSize * 3))}" fill="url(#headlightBloom)" opacity="${starIntensity * 0.92}"/><circle cx="${x}" cy="${y}" r="${starSize * 0.42}" fill="#fffdf2" opacity="${starIntensity}"/><path d="M ${x-starSize} ${y} L ${x+starSize} ${y} M ${x} ${y-starSize*0.88} L ${x} ${y+starSize*0.88}" stroke="#fff5d9" stroke-width="${Math.max(0.25, starSize * 0.2)}" stroke-linecap="round" opacity="${starIntensity}"/>`
            : `<ellipse cx="${x}" cy="${y}" rx="${spotWidth * 2.3}" ry="${spotHeight * 2.2}" fill="url(#headlightBloom)" filter="url(#headlightSoft)" opacity="${spotIntensity * 0.36}"/><ellipse cx="${x}" cy="${y}" rx="${spotWidth}" ry="${spotHeight}" fill="#fff4d7" filter="url(#headlightSoft)" opacity="${spotIntensity * 0.72}"/><ellipse cx="${x}" cy="${y}" rx="${spotWidth * 0.56}" ry="${spotHeight * 0.56}" fill="#fffdf5" opacity="${spotIntensity}"/>`;
          return `${roadBeam}${flare}`;
        }).join("")}
      </g><g id="daylights" style="display:${forceDrive ? '' : 'none'}">${ledCustomSvg}</g>`;
      if (baked) {
        /* The photo already has the cable, so draw no cable -- only the green
           dashes travelling along it while charging. Restores v1.0.0; v1.0.1
           dropped the whole overlay and took the animation with it. */
        const bakedPath = this._bakedCablePath();
        const cw = this._car.cable_thickness || 1.05;
        const gw = this._car.cable_thickness ? this._car.cable_thickness * 2.8 : 3;
        /* Softer than the drawn-cable green and slightly narrower, with a blurred
           edge: this rides on a photograph, so a hard bright line reads as a
           sticker laid over the picture rather than current moving along it. */
        const bakedDash = bakedPath ? `
  <svg class="car ovl" id="restChgOvl" viewBox="0 0 233 108" preserveAspectRatio="none"
       style="display:none;pointer-events:none;left:0;bottom:0;width:100%;height:100%;aspect-ratio:auto;overflow:visible">
    <defs>
      <filter id="cableSoft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="0.55"/>
      </filter>
    </defs>
    <path id="restCableDash" d="${bakedPath}" pathLength="100" stroke="#48865f" stroke-opacity=".58"
          stroke-width="${cw}" fill="none" stroke-linecap="round" stroke-dasharray="12 38"
          filter="url(#cableSoft)">
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.8s" repeatCount="indefinite"/>
    </path>
    <path id="restCableGlow" d="${bakedPath}" pathLength="100" stroke="#4fd07a" stroke-opacity=".6" stroke-width="${gw}" fill="none"
          stroke-linecap="round" stroke-dasharray="12 38" filter="url(#cableSoft)" style="display:none">
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite"/>
    </path>
    <path id="restCableBolt" d="${boltPathD}" fill="#4fd07a" style="display:none"/>
  </svg>` : "";
        return `
<div class="imgWrap rest" id="restWrap">
  <img id="restImg" class="carImg" src="${src}" data-basesrc="${src}" alt="">
  <svg class="car ovl" id="driveOvl" viewBox="-50 0 283 108" preserveAspectRatio="none"
       data-src="${src}" data-sfx="${rSfx}" style="display:none;pointer-events:none;overflow:visible;left:-21.46%;width:121.46%;height:100%;aspect-ratio:auto"></svg>
  <svg class="car ovl" id="restGlowOvl" viewBox="0 0 233 108" preserveAspectRatio="none" style="pointer-events:none;left:0;bottom:0;width:100%;height:100%;aspect-ratio:auto;overflow:visible"><defs><linearGradient id="headlightBeam" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#fff5dc" stop-opacity="0.38"/><stop offset="55%" stop-color="#e8f2ff" stop-opacity="0.12"/><stop offset="100%" stop-color="#e8f2ff" stop-opacity="0"/></linearGradient><radialGradient id="headlightBloom"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="38%" stop-color="#fff4d5" stop-opacity="0.4"/><stop offset="100%" stop-color="#fff4d5" stop-opacity="0"/></radialGradient><radialGradient id="headlightPool"><stop offset="0%" stop-color="#fff3d1" stop-opacity="0.22"/><stop offset="45%" stop-color="#f5efd9" stop-opacity="0.09"/><stop offset="100%" stop-color="#f5efd9" stop-opacity="0"/></radialGradient><filter id="headlightSoft" x="-30%" y="-40%" width="170%" height="190%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <defs>${dfDefs(rSfx, this._car)}</defs>
    ${dfGlow(rSfx, this._car, null, box)}
    ${headlightSvg}${interactiveFxSvg}
  </svg>${bakedDash}${restHotspots}
</div>`;
      }
      return `
<div class="imgWrap rest" id="restWrap">
  <img id="restImg" class="carImg" src="${src}" data-basesrc="${src}" alt="">
  <svg class="car ovl" id="driveOvl" viewBox="-50 0 283 108" preserveAspectRatio="none"
       data-src="${src}" data-sfx="${rSfx}" style="display:none;pointer-events:none;overflow:visible;left:-21.46%;width:121.46%;height:100%;aspect-ratio:auto"></svg>
  <svg class="car ovl" id="restGlowOvl" viewBox="0 0 233 108" preserveAspectRatio="none" style="pointer-events:none;left:0;bottom:0;width:100%;height:100%;aspect-ratio:auto;overflow:visible">
    <defs>
      ${dfDefs(rSfx, this._car)}

      <linearGradient id="headlightBeam" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#fff5dc" stop-opacity="0.38"/><stop offset="55%" stop-color="#e8f2ff" stop-opacity="0.12"/><stop offset="100%" stop-color="#e8f2ff" stop-opacity="0"/></linearGradient>
      <radialGradient id="headlightBloom"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="38%" stop-color="#fff4d5" stop-opacity="0.4"/><stop offset="100%" stop-color="#fff4d5" stop-opacity="0"/></radialGradient><radialGradient id="headlightPool"><stop offset="0%" stop-color="#fff3d1" stop-opacity="0.22"/><stop offset="45%" stop-color="#f5efd9" stop-opacity="0.09"/><stop offset="100%" stop-color="#f5efd9" stop-opacity="0"/></radialGradient>
      <filter id="headlightSoft" x="-30%" y="-40%" width="170%" height="190%"><feGaussianBlur stdDeviation="2.2"/></filter>
      <radialGradient id="lightDotG" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="lightGlimG" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8d87a" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#e8d87a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${dfGlow(rSfx, this._car, null, box)}
    ${headlightSvg}${interactiveFxSvg}
  </svg>
  <svg class="car ovl" id="restChgOvl" viewBox="0 0 233 108" preserveAspectRatio="none" style="display:none;left:0;bottom:0;width:100%;height:100%;aspect-ratio:auto;overflow:visible">
    <defs>
      <filter id="energyGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5"/></filter>
    </defs>
    <path id="restCable" d="${cable}" stroke="#3f6db5" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path id="restCableDash" d="${cable}" pathLength="100" stroke="#3aa869" stroke-opacity=".85" stroke-width="1.6" fill="none"
          stroke-linecap="round" stroke-dasharray="12 38" style="display:none">
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.8s" repeatCount="indefinite"/>
    </path>
    <path id="restCableGlow" d="${cable}" pathLength="100" stroke="#4fd07a" stroke-opacity=".6" stroke-width="5" fill="none"
          stroke-linecap="round" stroke-dasharray="12 38" filter="url(#energyGlow)" style="display:none">
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite"/>
    </path>
    <path id="restCableBolt" d="${boltPathD}" fill="#4fd07a" style="display:none"/>
    <circle id="restGlow" cx="${px}" cy="${py}" r="2.6" fill="#4fd07a" style="display:none">
      <animate attributeName="opacity" values="1;.45;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
  </svg>${restHotspots}
</div>`;
    }

    _transitionSnapshot(selector, className, cardRect) {
      const source = this.shadowRoot && this.shadowRoot.querySelector(selector);
      if (!source || !cardRect) return null;
      const rect = source.getBoundingClientRect();
      const hostRect = this.getBoundingClientRect();
      const copy = source.cloneNode(true);
      const animatedProperties = new Set([
        "animation", "animation-delay", "animation-direction", "animation-duration", "animation-fill-mode",
        "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function",
        "transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function",
        "transform", "transform-origin", "translate", "rotate", "scale", "will-change"
      ]);
      /* Only the wrapper and its first two layout levels need frozen computed
         styles. Deep SVG art keeps its own attributes and embedded stylesheet;
         walking every path and SMIL node here blocked the click before the fade
         could even begin (especially when leaving climate with its cable clone). */
      const freezeLayout = (sourceNode, copyNode, depth) => {
        const computed = getComputedStyle(sourceNode);
        for (let i = 0; i < computed.length; i++) {
          const property = computed[i];
          if (!animatedProperties.has(property)) copyNode.style.setProperty(property, computed.getPropertyValue(property));
        }
        if (depth >= 2) return;
        Array.from(sourceNode.children).forEach((child, index) => {
          const childCopy = copyNode.children[index];
          if (childCopy) freezeLayout(child, childCopy, depth + 1);
        });
      };
      freezeLayout(source, copy, 0);

      if (selector === "#climCableLayer") copy.style.background = "transparent";
      const idMap = new Map();
      const prefix = `transition-${Date.now()}-${Math.random().toString(36).slice(2)}-`;
      const cloneNodes = [copy, ...copy.querySelectorAll("*")];
      cloneNodes.forEach((el) => {
        if (!el.id) return;
        const old = el.id;
        idMap.set(old, prefix + old);
        el.id = prefix + old;
      });
      cloneNodes.forEach((el) => Array.from(el.attributes).forEach((a) => {
        const value = a.value
          .replace(/url\(#([^)]+)\)/g, (match, old) => idMap.has(old) ? `url(#${idMap.get(old)})` : match)
          .replace(/^#(.+)$/, (match, old) => idMap.has(old) ? `#${idMap.get(old)}` : match);
        if (value !== a.value) el.setAttribute(a.name, value);
      }));
      copy.inert = true;
      copy.setAttribute("aria-hidden", "true");
      copy.classList.add("transitionSnapshot", "carDepart", className);
      Object.assign(copy.style, {
        left: `${rect.left - hostRect.left}px`, top: `${rect.top - hostRect.top}px`, right: "auto", bottom: "auto",
        width: `${rect.width}px`, height: `${rect.height}px`, margin: "0", maxWidth: "none", boxSizing: "border-box"
      });
      const direction = className === "fromClimate" ? "to_main" : "to_climate";
      const timing = this._climateTransitionTiming(direction);
      copy.style.setProperty("--climate-away-duration", `${timing.drive_away}s`);
      return copy;
    }


    _positionRestFrunkHit() {
      const sr = this.shadowRoot;
      const button = sr && sr.getElementById("restFrunkHitButton");
      const stage = sr && sr.getElementById("carStage");
      const bounds = sr && sr.getElementById("restFrunkHitBounds");
      if (!button || !stage || !bounds || this._view) {
        if (button) button.style.display = "none";
        return;
      }
      const overlay = sr.getElementById("restHotspotsOvl");
      const isMoving = sr.querySelector(".imgWrap.rest.driving");
      if ((overlay && overlay.classList.contains("restHotspotsPending")) || isMoving || getComputedStyle(bounds).display === "none") {
        button.style.display = "none";
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const hitRect = bounds.getBoundingClientRect();
      if (!stageRect.width || !hitRect.width || !hitRect.height) {
        button.style.display = "none";
        return;
      }
      const pad = 8;
      button.style.left = `${hitRect.left - stageRect.left - pad}px`;
      button.style.top = `${hitRect.top - stageRect.top - pad}px`;
      button.style.width = `${hitRect.width + pad * 2}px`;
      button.style.height = `${hitRect.height + pad * 2}px`;
      button.style.display = "block";
      if (!this._restFrunkHitObserver && typeof ResizeObserver !== "undefined") {
        this._restFrunkHitObserver = new ResizeObserver(() => this._positionRestFrunkHit());
        this._restFrunkHitObserver.observe(stage);
        this._restFrunkHitObserver.observe(bounds);
      }
    }

    _positionClimateLayout() {
      if (this._view !== "clim" || !this.shadowRoot) return;
      const page = this.shadowRoot.querySelector(".climPage");
      const image = this.shadowRoot.querySelector(".climWrap .climImg");
      const left = this.shadowRoot.querySelector(".climLeft");
      if (!page || !image || !left) return;
      const pr = page.getBoundingClientRect(), ir = image.getBoundingClientRect();
      if (!pr.width || !ir.width) return;
      /* Size the left-side panel to the real gap between card edge and image. */
      const leftPanelWidth = Math.max(0, ir.left - pr.left - 16);
      const bottomControls = String(this._car && this._car.climate_controls_position || "left").trim().toLowerCase() === "bottom";
      page.style.setProperty("--clim-panel-width", `${leftPanelWidth}px`);
      left.style.width = bottomControls ? `${pr.width}px` : `${leftPanelWidth}px`;
      const controls = this.shadowRoot.querySelector(".climCtl");
      const extras = page.querySelector(".climExtrasOverlay");
      if (extras && controls && bottomControls) {
        extras.style.setProperty("--clim-controls-placeholder", `${controls.getBoundingClientRect().height + 32}px`);
      } else if (extras) extras.style.removeProperty("--clim-controls-placeholder");
      /* The buttons stay in the left-side stack; only the Power/temperature/
         Vent row moves when the bottom layout is selected. */
      page.querySelectorAll(".climModesBlock > .climX").forEach((button) => {
        button.style.width = `${leftPanelWidth}px`;
      });
      const temps = page.querySelector(".climTemps");
      const status = this.shadowRoot.querySelector(".infoStack");
      if (temps && status && controls) {
        const statusRect = status.getBoundingClientRect();
        const controlRect = controls.getBoundingClientRect();
        const pageRect = page.getBoundingClientRect();
        const defrost = page.querySelector("#btnDefrost");
        const lowerBoundary = bottomControls && defrost ? defrost.getBoundingClientRect().top : controlRect.top;
        const centerY = (statusRect.bottom + lowerBoundary) / 2;
        temps.style.top = `${Math.round(centerY - pageRect.top)}px`;
      }
      const cop = this.shadowRoot.querySelector(".copWrap");
      const pet = page.querySelector("#btnPet");
      const card = this.shadowRoot.querySelector("ha-card");
      const copParent = cop && cop.offsetParent;
      if (cop && pet && card && copParent) {
        const petRect = pet.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const parentRect = copParent.getBoundingClientRect();
        const cardBottom = cardRect.bottom - (parseFloat(getComputedStyle(card).paddingBottom) || 0);
        const regionBottom = bottomControls && controls
          ? Math.min(cardBottom, controls.getBoundingClientRect().top)
          : cardBottom;
        const centerY = (petRect.bottom + regionBottom) / 2;
        cop.style.top = `${Math.round(centerY - parentRect.top - cop.offsetHeight / 2)}px`;
        cop.style.bottom = "auto";
      }
    }

    _updateClimateCable() {
      if (this._view !== "clim" || !this.shadowRoot) return;
      const carSvg = this.shadowRoot.querySelector(".climWrap svg.ovl");
      const page = this.shadowRoot.querySelector(".climPage");
      const card = this.shadowRoot.querySelector("ha-card");
      const layer = this.shadowRoot.getElementById("climCableLayer");
      const cable = this.shadowRoot.getElementById("climCableLive");
      const dash = this.shadowRoot.getElementById("climCableDashLive");
      const climatePhoto = this._img("image_climate");
      const defaultPort = /climate3\.(?:jpg|png)(?:\?|$)/.test(climatePhoto) ? [56, 520] : (this._packClimPort() || [78, 478]);
      const port = anchor(this._car.climate_anchors || {}, "port", defaultPort);
      if (!carSvg || !page || !card || !layer || !cable || !port) return;
      const sr = carSvg.getBoundingClientRect(), pr = page.getBoundingClientRect(), cr = card.getBoundingClientRect();
      if (!sr.width || !sr.height || !pr.width || !pr.height) return;
      const view = carSvg.viewBox.baseVal;
      const scaleX = sr.width / view.width, scaleY = sr.height / view.height;
      const px = sr.left - pr.left + port[0] * scaleX;
      const py = sr.top - pr.top + port[1] * scaleY;
      const cardBottomY = cr.bottom - pr.top;
      layer.setAttribute("viewBox", `0 0 ${pr.width} ${pr.height}`);
      /* In climate view the cable drops from the port, sweeps left, and exits
         the card edge. Keep the exit tied to the card bottom and the car port
         tied to the positioned climate image. */
      const exitX = -16;
      const exitY = Math.min(cardBottomY - 10, Math.max(py + 48 * scaleY, cardBottomY * .88));
      const leadLeft = Math.max(18, Math.min(28, pr.width * .05));
      const bendLeft = Math.max(50, Math.min(68, pr.width * .13));
      const bendDown = Math.max(34, Math.min(54, pr.height * .1));
      const exitHandle = Math.max(55, Math.min(92, pr.width * .18));
      const bendX = px - bendLeft;
      const bendY = py + bendDown;
      const d = `M ${px} ${py} C ${px - leadLeft * .4} ${py} ${px - leadLeft * .8} ${py + bendDown * .08} ${px - leadLeft} ${py + bendDown * .28} C ${px - bendLeft * .55} ${py + bendDown * .82} ${px - bendLeft * .82} ${bendY} ${bendX} ${bendY} C ${bendX - exitHandle * .45} ${bendY + 4} ${exitX + exitHandle * .72} ${exitY - 6} ${exitX} ${exitY}`;
      cable.setAttribute("d", d);
      if (dash) dash.setAttribute("d", d);
      const bolt = this.shadowRoot.getElementById("climBolt");
      if (bolt) {
        const boltX = px - leadLeft * .4;
        bolt.setAttribute("transform", `translate(${boltX - 4.5} ${py - 15}) scale(.6)`);
      }
    }

    _trackClimateCable() {
      if (this._view !== "clim" || !this._climateDriveTimer) return;
      this._updateClimateCable();
      this._climateCableFrame = requestAnimationFrame(() => this._trackClimateCable());
    }

    _climateTransitionTiming(direction) {
      const configured = (this._car && this._car.climate_transition) || {};
      const values = configured[direction] || {};
      const seconds = (value, fallback) => {
        if (value === undefined || value === null || value === "") return fallback;
        let n;
        if (typeof value === "string" && /ms$/i.test(value.trim())) n = parseFloat(value) / 1000;
        else n = parseFloat(value);
        return Number.isFinite(n) ? Math.max(0.08, Math.min(5, n)) : fallback;
      };
      return {
        drive_away: seconds(values.drive_away, 0.5625),
        drive_in: seconds(values.drive_in, 0.72)
      };
    }

    /* put the back button right of the battery line (which sits below the status line) */
    _placeBack() {
      const sr = this.shadowRoot;
      if (!sr || this._view !== "clim") return;
      const bb = sr.getElementById("ctlBack"), card = sr.querySelector("ha-card"), bl = sr.querySelector(".battLine");
      if (!bb || !card || !bl) return;
      const car = this._car || {};
      const backX = car.climate_back_x !== undefined ? car.climate_back_x : car.climate_back_left;
      const backY = car.climate_back_y !== undefined ? car.climate_back_y : car.climate_back_top;
      if (backX !== undefined && backX !== null && backX !== "") bb.style.left = "var(--clim-back-left)";
      if (backY !== undefined && backY !== null && backY !== "") bb.style.top = "var(--clim-back-top)";
      let right = 0;
      Array.from(bl.children).forEach((c) => { const r = c.getBoundingClientRect(); if (r.width > 0 && r.height > 0) right = Math.max(right, r.right); });
      const br = bl.getBoundingClientRect(), cr = card.getBoundingClientRect();
      if (!right || !cr.width || !br.height) return;
      const size = bb.offsetWidth || 28;
      if (backX === undefined || backX === null || backX === "") bb.style.left = `${Math.round(right - cr.left + 10)}px`;
      if (backY === undefined || backY === null || backY === "") bb.style.top = `${Math.round(br.top + br.height / 2 - cr.top - size / 2)}px`;
    }

    _setView(v) {
      if (this._climateTransitionTarget) {
        const activeTarget = this._climateTransitionTarget === "main" ? "" : this._climateTransitionTarget;
        if (v !== activeTarget) this._queuedClimateView = v;
        return;
      }
      if (this._view === v) return;
      const enteringClimate = v === "clim" && this._view !== "clim";
      const leavingClimate = this._view === "clim" && v !== "clim";
      const shiftState = String((this._st("shift") || {}).state || "").trim().toLowerCase();
      const movingForInfo = this._forceDriveAnim() || ["d", "r", "n", "drive", "reverse", "neutral"].includes(shiftState) || (Number(this._speedKph()) || 0) > 1;
      const keepParkedInfo = !this._visualPlugged() && !this._charging() && !movingForInfo;
      const infoSelectors = keepParkedInfo ? [] : [".infoStack"];

      /* Other view changes stay synchronous. Climate is the only view whose
         geometry differs enough to need a staged handoff. */
      if (!(enteringClimate || leavingClimate)) {
        if (this._view === "map") { this._mapEl = null; this._mapWanted = null; }
        this._view = v;
        this._built = false;
        this._build();
        this._update();
        return;
      }

      clearTimeout(this._climateDriveTimer);
      this._climateDriveTimer = null;
      if (this._climateCableFrame) cancelAnimationFrame(this._climateCableFrame);
      this._climateCableFrame = null;
      if (this.shadowRoot) {
        this.shadowRoot.querySelectorAll(".transitionSnapshot, .snapLayer").forEach((el) => el.remove());
        this.shadowRoot.querySelectorAll(".transitionFadeLive, .transitionSourceHidden, .driveIn, .mainArrival, .mainArrivalPlugged, .mainUIArrival, .climateMenuIn, .restHotspotsPending, .restHotspotsFadeIn").forEach((el) => {
          el.classList.remove("transitionFadeLive", "transitionSourceHidden", "driveIn", "mainArrival", "mainArrivalPlugged", "mainUIArrival", "climateMenuIn", "restHotspotsPending", "restHotspotsFadeIn");
          el.style.removeProperty("--climate-away-duration");
          el.style.removeProperty("--climate-drive-in-delay");
          el.style.removeProperty("--climate-ui-in-delay");
        });
      }

      const sourceView = this._view;
      const oldCard = this.shadowRoot && this.shadowRoot.querySelector("ha-card");
      const oldCardRect = oldCard && oldCard.getBoundingClientRect();
      if (!oldCard || !oldCardRect || !oldCardRect.height) {
        if (sourceView === "map") { this._mapEl = null; this._mapWanted = null; }
        this._view = v;
        this._built = false;
        this._build();
        this._update();
        return;
      }

      const timing = this._climateTransitionTiming(enteringClimate ? "to_climate" : "to_main");
      const reducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      const awayMs = reducedMotion ? 24 : Math.round(timing.drive_away * 1000);
      const driveInMs = reducedMotion ? 24 : Math.round(timing.drive_in * 1000);
      const uiFadeMs = reducedMotion ? 24 : 360;
      const sourceHeight = oldCardRect.height;
      let targetHeight = sourceHeight;
      let chargeRowWasOpen = false;

      /* Measure the climate card at its normal collapsed height without leaving
         the source view collapsed during the departure animation. */
      if (enteringClimate) {
        const chargeRow = this.shadowRoot.querySelector("#rowChg");
        chargeRowWasOpen = !!(chargeRow && chargeRow.classList.contains("open"));
        if (chargeRowWasOpen) {
          chargeRow.classList.remove("open");
          targetHeight = oldCard.getBoundingClientRect().height || sourceHeight;
          chargeRow.classList.add("open");
        }
        this._climateMainHeight = targetHeight;
      }

      const carSelector = enteringClimate ? "#restWrap" : ".climWrap";
      const carClass = enteringClimate
        ? (this._visualPlugged() ? "toClimatePlugged" : "toClimateUnplugged")
        : "fromClimate";
      const car = this._transitionSnapshot(carSelector, carClass, oldCardRect);
      if (enteringClimate && car) {
        const hotspotSnapshot = car.querySelector(".restHotspotsOverlay");
        if (hotspotSnapshot) {
          hotspotSnapshot.style.setProperty("--climate-away-duration", `${timing.drive_away}s`);
          hotspotSnapshot.classList.add("transitionFadeLive");
        }
      }
      const layer = document.createElement("div");
      let cableLayer = null;
      layer.className = "snapLayer carSnapLayer";
      if (car) {
        layer.appendChild(car);
        if (leavingClimate) {
          const cable = this._transitionSnapshot("#climCableLayer", "fromClimate", oldCardRect);
          if (cable) {
            cable.classList.remove("transitionSnapshot", "carDepart", "fromClimate");
            cable.classList.add("transitionFadeLive");
            Object.assign(cable.style, {
              right: "auto", bottom: "auto", zIndex: "8", transform: "none", background: "transparent"
            });
            cableLayer = document.createElement("div");
            cableLayer.className = "snapLayer cableSnapLayer";
            cableLayer.appendChild(cable);
          }
        }
      }

      const sourceCar = this.shadowRoot.querySelector(carSelector);
      const sourceCable = leavingClimate ? this.shadowRoot.querySelector("#climCableLayer") : null;
      const transitionElements = enteringClimate
        ? [".acts", ".rows", ".ftr", ...infoSelectors, ...(this._car && this._car.climate_hide_model === true ? [".nmModel"] : [])]
        : [".climPage", "#ctlBack", ...infoSelectors, ...(this._car && this._car.climate_hide_model === true ? [".nmModel"] : [])];
      transitionElements.forEach((selector) => {
        const element = this.shadowRoot.querySelector(selector);
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        if (!bounds.width && !bounds.height) return;
        element.style.setProperty("--climate-away-duration", `${timing.drive_away}s`);
        element.classList.add("transitionFadeLive");
      });
      if (sourceCar) sourceCar.classList.add("transitionSourceHidden");
      if (sourceCable) sourceCable.classList.add("transitionSourceHidden");

      /* Keep the old view's exact card box until its car and live UI have left.
         The target DOM is not created until this timer fires. */
      oldCard.style.height = `${sourceHeight}px`;
      oldCard.style.minHeight = `${sourceHeight}px`;
      oldCard.style.overflow = "hidden";

      this._climateTransitionTarget = v || "main";
      const token = (this._climateTransitionToken || 0) + 1;
      this._climateTransitionToken = token;
      this.shadowRoot.appendChild(layer);
      if (cableLayer) this.shadowRoot.appendChild(cableLayer);

      this._climateDriveTimer = window.setTimeout(() => {
        if (token !== this._climateTransitionToken || !this.shadowRoot) return;
        if (this._climateCableFrame) cancelAnimationFrame(this._climateCableFrame);
        this._climateCableFrame = null;
        layer.remove();
        if (cableLayer) cableLayer.remove();

        if (enteringClimate && chargeRowWasOpen) {
          const chargeRow = this.shadowRoot.querySelector("#rowChg");
          if (chargeRow) chargeRow.classList.remove("open");
          if (this._openRows) this._openRows.rowChg = false;
        }
        if (sourceView === "map") { this._mapEl = null; this._mapWanted = null; }

        this._view = v;
        this._built = false;
        this._build();
        this._update();

        const card = this.shadowRoot.querySelector("ha-card");
        const heldHeight = enteringClimate ? targetHeight : (this._climateMainHeight || sourceHeight);
        if (card) {
          card.style.height = `${heldHeight}px`;
          card.style.minHeight = `${heldHeight}px`;
          card.style.overflow = "hidden";
          card.style.setProperty("--climate-ui-in-delay", "0ms");
        }

        if (enteringClimate) {
          const clim = this.shadowRoot.querySelector(".climWrap");
          if (clim) {
            clim.style.setProperty("--climate-drive-in-duration", `${timing.drive_in}s`);
            clim.style.setProperty("--climate-drive-in-delay", "0ms");
            void clim.offsetWidth;
            clim.classList.add("driveIn");
          }
          [".nmModel", ...infoSelectors, ".climTemps", ".climExtrasOverlay", ".copWrap", ".backBtn", "#climCableLiveGroup"].forEach((selector) => {
            const element = this.shadowRoot.querySelector(selector);
            if (element) element.classList.add("climateMenuIn");
          });
          this._climateDriveTimer = window.setTimeout(() => {
            if (token !== this._climateTransitionToken || !this.shadowRoot) return;
            if (this._climateCableFrame) cancelAnimationFrame(this._climateCableFrame);
            this._climateCableFrame = null;
            if (clim) {
              clim.classList.remove("driveIn");
              clim.style.removeProperty("--climate-drive-in-duration");
              clim.style.removeProperty("--climate-drive-in-delay");
            }
            this.shadowRoot.querySelectorAll(".climateMenuIn").forEach((el) => el.classList.remove("climateMenuIn"));
            const liveCard = this.shadowRoot.querySelector("ha-card");
            if (liveCard) liveCard.style.removeProperty("--climate-ui-in-delay");
            this._positionClimateLayout();
            this._updateClimateCable();
            this._climateTransitionTarget = null;
            this._climateDriveTimer = null;
            this._flushRebuild();
            this._drainQueuedClimateView();
          }, Math.ceil(Math.max(driveInMs, uiFadeMs) + 120));
          this._trackClimateCable();
        } else {
          const arrival = this.shadowRoot.getElementById("carBox");
          const restHotspots = this.shadowRoot.getElementById("restHotspotsOvl");
          if (restHotspots) {
            restHotspots.classList.add("restHotspotsPending");
            const hotspotFadeDelay = Math.max(0, Math.ceil(Math.max(driveInMs, uiFadeMs) + 120 - 250));
            window.setTimeout(() => {
              if (token !== this._climateTransitionToken || !this.shadowRoot) return;
              const liveHotspots = this.shadowRoot.getElementById("restHotspotsOvl");
              if (liveHotspots) {
                liveHotspots.classList.remove("restHotspotsPending");
                liveHotspots.classList.add("restHotspotsFadeIn");
              }
              this._positionRestFrunkHit();
            }, hotspotFadeDelay);
          }
          if (arrival) {
            arrival.style.setProperty("--climate-drive-in-duration", `${timing.drive_in}s`);
            arrival.style.setProperty("--climate-drive-in-delay", "0ms");
            void arrival.offsetWidth;
            arrival.classList.add("mainArrival");
            if (this._visualPlugged()) arrival.classList.add("mainArrivalPlugged");
          }
          [".acts", ".rows", ".ftr", ...infoSelectors, ...(this._car && this._car.climate_hide_model === true ? [".nmModel"] : [])].forEach((selector) => {
            const element = this.shadowRoot.querySelector(selector);
            if (element) element.classList.add("mainUIArrival");
          });
          this._climateDriveTimer = window.setTimeout(() => {
            if (token !== this._climateTransitionToken || !this.shadowRoot) return;
            if (arrival) {
              arrival.classList.remove("mainArrival", "mainArrivalPlugged");
              arrival.style.removeProperty("--climate-drive-in-duration");
              arrival.style.removeProperty("--climate-drive-in-delay");
            }
            this.shadowRoot.querySelectorAll(".mainUIArrival").forEach((el) => el.classList.remove("mainUIArrival"));
            if (restHotspots) restHotspots.classList.remove("restHotspotsPending");
            this._positionRestFrunkHit();
            const liveCard = this.shadowRoot.querySelector("ha-card");
            if (liveCard) {
              liveCard.style.height = "";
              liveCard.style.minHeight = "";
              liveCard.style.overflow = "";
              liveCard.style.removeProperty("--climate-ui-in-delay");
            }
            this._climateMainHeight = null;
            this._climateTransitionTarget = null;
            this._climateDriveTimer = null;
            this._flushRebuild();
            this._drainQueuedClimateView();
          }, Math.ceil(Math.max(driveInMs, uiFadeMs) + 120));
        }
      }, Math.max(0, awayMs + 20));
    }
    _carImg() {
      const chg = this._hass ? this._charging() : false;
      const plg = this._visualPlugged();
      const tsrc = (chg && this._img("image_top_charging")) ||
                   (plg && this._img("image_top_plugged")) ||
                   this._img("image");
      const baked = this._cableBaked();
      const [bx, by] = String(this._portXY("port_top_xy")).split(",").map(Number);
      const boltArea = baked
        ? `<g id="boltPulse" style="display:none" transform="translate(${bx},${by})">
      <g>
        <path d="M2 -13 L -7 3 h 5 l -3 12 l 11 -17 h -6 l 5 -11 z" fill="#2bd96f"/>
        <animateTransform attributeName="transform" type="scale" values="1;1.28;1" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".85;1;.85" dur="1.5s" repeatCount="indefinite"/>
      </g>
    </g>`
        : `<g id="boltG">
      <path id="cableP" d="M 8 750 C 20 716 30 668 46 606" stroke="#4fd07a" stroke-width="5" fill="none"
            stroke-linecap="round" style="display:none">
        <animate attributeName="stroke-dashoffset" from="36" to="0" dur="1.2s" repeatCount="indefinite"/>
      </path>
      <path id="boltP" d="M56 566 L 44 586 h 8 l -4 16 l 14 -22 h -8 l 6 -14 z" fill="#9aa0a6"/>
    </g>`;
      const TA = this._car.top_anchors || {};
      const [fkx, fky] = anchor(TA, "frunk", [180, 108]);

      const [tkx, tky] = anchor(TA, "trunk", [180, baked ? 658 : 612]);
      const tpmsFrontY = baked ? 150 : 120;
      const tpmsRearY = baked ? 640 : 650;
      return `
<div class="imgWrap">
  <img id="topImg" class="carImg" src="${tsrc}" alt="">
  ${this._car.calibrate ? '<div class="calib" id="calibOut">calibrate: tap the image to read x,y</div>' : ""}
  <svg class="car ovl" viewBox="0 0 360 773" preserveAspectRatio="none">
    <defs>${dfDefs("Top", this._car)}</defs>
    ${dfGlow("Top", this._car, null, this._carBox(tsrc, "Top"))}
    <g paint-order="stroke" stroke="#000000aa" stroke-width="3">
      <g id="frunkTap" class="tapa">
        <rect x="${fkx - 70}" y="${fky - 78}" width="140" height="130" rx="16" fill="#000" opacity="0" stroke="none"/>
        <text id="frunkLbl" class="olbl" x="${fkx}" y="${fky}" text-anchor="middle"
              font-size="20" font-weight="600" fill="#f2f3f4">Open</text>
      </g>
      <g id="trunkTap" class="tapa">
        <rect x="${tkx - 70}" y="${tky - 72}" width="140" height="120" rx="16" fill="#000" opacity="0" stroke="none"/>
        <text id="trunkLbl" class="olbl" x="${tkx}" y="${tky}" text-anchor="middle"
              font-size="20" font-weight="600" fill="#f2f3f4">Open</text>
      </g>
    </g>

    ${boltArea}
    <g id="sentryEye" style="display:none">
      <circle cx="180" cy="14" r="8" fill="#141414" stroke="#d53a3a" stroke-width="2"/>
      <circle cx="180" cy="14" r="3" fill="#d53a3a">
        <animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/>
      </circle>
    </g>
    <g id="tpmsG" font-size="15" font-weight="600" fill="#ececec" ${this._config.show_tpms ? "" : 'style="display:none"'}>
      <text id="tpFL" x="34" y="${tpmsFrontY}" text-anchor="middle">-</text>
      <text id="tpFR" x="326" y="${tpmsFrontY}" text-anchor="middle">-</text>
      <text id="tpRL" x="34" y="${tpmsRearY}" text-anchor="middle">-</text>
      <text id="tpRR" x="326" y="${tpmsRearY}" text-anchor="middle">-</text>
    </g>
  </svg>
</div>`;
    }

    /* Drawn cabin used when no interior photo exists - feature positions sit at
       the same fractional coordinates the heat-wave overlay expects. */
    _climCabinSvg() {
      return `
<svg class="carImg climImg" viewBox="0 0 360 480" style="display:block;width:300px;height:400px;max-height:none">
  <defs>
    <linearGradient id="cabV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#23262b"/><stop offset=".18" stop-color="#1a1c20"/>
      <stop offset="1" stop-color="#141619"/>
    </linearGradient>
  </defs>
  <!-- cabin shell -->
  <path d="M70 34 C 110 18 250 18 290 34 C 306 42 314 60 316 92 L 320 380
           C 320 428 306 452 278 458 C 220 468 140 468 82 458 C 54 452 40 428 40 380
           L 44 92 C 46 60 54 42 70 34 Z" fill="url(#cabV)" stroke="#0b0c0e" stroke-width="2"/>
  <!-- windshield header -->
  <path d="M70 34 C 110 18 250 18 290 34 C 298 38 304 45 308 55 C 260 40 100 40 52 55
           C 56 45 62 38 70 34 Z" fill="#0e1013"/>
  <!-- dash -->
  <path d="M54 58 C 110 44 250 44 306 58 L 306 84 C 250 72 110 72 54 84 Z" fill="#2a2d33"/>
  <path d="M150 62 L 210 62 L 208 78 L 152 78 Z" fill="#17191d"/>
  <!-- steering wheel -->
  ${this._car.steering === "right" ?
    `<circle cx="234" cy="78" r="25" fill="none" stroke="#3d4147" stroke-width="7"/>
     <circle cx="234" cy="78" r="4" fill="#3d4147"/>
     <path d="M212 74 L 230 78 M256 74 L 238 78 M234 100 L 234 84" stroke="#3d4147" stroke-width="5" stroke-linecap="round"/>`
  :
    `<circle cx="121" cy="78" r="25" fill="none" stroke="#3d4147" stroke-width="7"/>
     <circle cx="121" cy="78" r="4" fill="#3d4147"/>
     <path d="M99 74 L 117 78 M143 74 L 125 78 M121 100 L 121 84" stroke="#3d4147" stroke-width="5" stroke-linecap="round"/>`
  }
  <!-- door panels -->
  <path d="M44 100 L 60 104 L 58 400 L 42 396 Z" fill="#202329"/>
  <path d="M316 100 L 300 104 L 302 400 L 318 396 Z" fill="#202329"/>
  <!-- centre console -->
  <rect x="163" y="98" width="34" height="104" rx="10" fill="#22252a"/>
  <rect x="169" y="106" width="22" height="32" rx="5" fill="#17191d"/>
  <!-- front seats (centres align with the heat-wave anchors) -->
  <g fill="#2e3237" stroke="#0e1013" stroke-width="1.5">
    <rect x="91" y="88" width="60" height="12" rx="6"/>
    <path d="M87 104 h 68 a10 10 0 0 1 10 10 v 40 a12 12 0 0 1 -12 12 h -64 a12 12 0 0 1 -12 -12 v -40 a10 10 0 0 1 10 -10 Z"/>
    <rect x="203" y="88" width="60" height="12" rx="6"/>
    <path d="M199 104 h 68 a10 10 0 0 1 10 10 v 40 a12 12 0 0 1 -12 12 h -64 a12 12 0 0 1 -12 -12 v -40 a10 10 0 0 1 10 -10 Z"/>
  </g>
  <g stroke="#1c1f23" stroke-width="2" fill="none">
    <path d="M97 112 v 44 M145 112 v 44 M209 112 v 44 M257 112 v 44"/>
  </g>
  <!-- rear bench -->
  <g fill="#2e3237" stroke="#0e1013" stroke-width="1.5">
    <rect x="97" y="188" width="52" height="11" rx="5.5"/>
    <rect x="150" y="188" width="52" height="11" rx="5.5"/>
    <rect x="203" y="188" width="52" height="11" rx="5.5"/>
    <path d="M84 204 h 192 a12 12 0 0 1 12 12 v 40 a14 14 0 0 1 -14 14 h -188 a14 14 0 0 1 -14 -14 v -40 a12 12 0 0 1 12 -12 Z"/>
  </g>
  <path d="M150 210 v 54 M210 210 v 54" stroke="#1c1f23" stroke-width="2.5"/>
  <!-- boot floor -->
  <rect x="70" y="290" width="220" height="138" rx="16" fill="#191b1f"/>
  <path d="M84 306 h 192 M84 330 h 192" stroke="#212429" stroke-width="2"/>
</svg>`;
    }

    _climAnchors() {
      const m = this._car.climate_anchors || {};
      const climate3 = /climate3\.(?:jpg|png)(?:\?|$)/.test(this._img("image_climate"));
      const defaults = climate3 ? CLIM3_ANCHOR_DEFAULTS : CLIM_ANCHOR_DEFAULTS;
      const pos = {};
      Object.keys(defaults).forEach((k) => { pos[k] = anchor(m, k, defaults[k]); });
      if (!m.wheel && this._car.steering !== "right") {
        pos.wheel = climate3 ? [121, 220] : [121, 97];
      }
      return pos;
    }

    _carClim() {
      const car = this._car;
      const photo = this._img("image_climate");
      const A = this._climAnchors();
      const cm = car.climate_anchors || {};
      const climatePhoto = this._img("image_climate");
      const defaultPort = /climate3\.(?:jpg|png)(?:\?|$)/.test(climatePhoto) ? [56, 520] : (this._packClimPort() || [78, 478]);
      const [ppx, ppy] = anchor(cm, "port", defaultPort);
      /* cable: from the card's bottom edge (the svg overflows, the card clips it) up to the port; starts at the
         bottom so the charging dash flows towards the car */
      const cableX = ppx - 18, cableBottom = 650;
      const cablePath = `M ${cableX} ${cableBottom} L ${cableX} ${ppy + 36} C ${cableX} ${ppy + 20} ${ppx - 8} ${ppy + 10} ${ppx} ${ppy}`;
      const vY = A && A.vents && Number.isFinite(Number(A.vents[1]))
        ? Number(A.vents[1])
        : ((A && A.fl && A.fl[1] !== undefined) ? A.fl[1] - 190 : 60);
      const vent = (x, rot, cls) => {
        const coneDur = cls === "vR" ? "3s" : "3.6s";
        const coneBeg = cls === "vR" ? "1.1s" : "0s";
        const s1Beg = cls === "vR" ? "0.7s" : "0s";
        return `
      <g class="vent ${cls}" transform="translate(${x} ${vY}) rotate(${rot})">
        <path class="cone" d="M -9 0 L -44 186 Q 0 210 44 186 L 9 0 Z" fill="url(#coneG)" filter="url(#mistBlur)">
          <animate attributeName="opacity" values=".7;1;.7" keyTimes="0;.5;1" dur="${coneDur}" begin="${coneBeg}" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="scale" values=".94 1;1.08 1;.94 1" keyTimes="0;.5;1"
                            calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="${coneDur}" begin="${coneBeg}" repeatCount="indefinite"/>
        </path>
        <g clip-path="url(#coneClip-${cls})">
          <path class="streak s1" d="M -18 32 C -26 66 -10 100 -20 140" stroke="#eef3f8" stroke-width="11"
                fill="none" stroke-linecap="round" filter="url(#mistBlur)" opacity="0">
            <animate attributeName="opacity" values="0;.5;.3;0" keyTimes="0;.25;.7;1" dur="2.6s" begin="${s1Beg}" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="translate" values="0 -16;0 52" dur="2.6s" begin="${s1Beg}" repeatCount="indefinite"/>
          </path>
          <path class="streak s2" d="M 15 26 C 8 64 24 102 13 144" stroke="#eef3f8" stroke-width="10"
                fill="none" stroke-linecap="round" filter="url(#mistBlur)" opacity="0">
            <animate attributeName="opacity" values="0;.5;.3;0" keyTimes="0;.25;.7;1" dur="3.1s" begin="1.3s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="translate" values="0 -16;0 52" dur="3.1s" begin="1.3s" repeatCount="indefinite"/>
          </path>
        </g>
      </g>`;
      };
      return `
<div class="imgWrap climWrap">
  ${photo ? `<img class="carImg climImg" src="${photo}" alt="">` : this._climCabinSvg()}
  ${car.calibrate ? '<div class="calib" id="calibOut">calibrate: tap the image to read x,y</div>' : ""}
  <svg class="car ovl" viewBox="0 0 360 600" preserveAspectRatio="none">
    <defs>
      <filter id="mistBlur" x="-120%" y="-30%" width="340%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
      <linearGradient id="coneG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e6ecf3" stop-opacity=".5"/>
        <stop offset=".55" stop-color="#e6ecf3" stop-opacity=".22"/>
        <stop offset="1" stop-color="#e6ecf3" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="coneClip-vL"><path d="M -11 0 L -46 188 Q 0 214 46 188 L 11 0 Z"/></clipPath>
      <clipPath id="coneClip-vR"><path d="M -11 0 L -46 188 Q 0 214 46 188 L 11 0 Z"/></clipPath>
      ${dfDefs("Clim", car)}
    </defs>
    ${dfGlow("Clim", car, null, this._carBox(photo, "Clim"))}
    <g id="climHaze" style="display:none">
      ${vent(A.fl[0], -3, "vL")}
      ${vent(A.fr[0], 3, "vR")}
    </g>
    <!-- The climate photo is an interior view; the exterior pack's baked
         cable does not appear in it, so always render the cable overlay here. -->
    <g id="climCableG" style="display:none">
      <path id="climCableLocal" d="${cablePath}" style="display:none"
            stroke="#3f6db5" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path id="climCableDashLocal" d="${cablePath}"
            pathLength="100" stroke="#3aa869" stroke-opacity=".72" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-dasharray="12 38" style="display:none">
        <animate attributeName="stroke-dashoffset" from="0" to="100" dur="2s" repeatCount="indefinite"/>
      </path>
      <rect id="climPortNub" x="${ppx - 4}" y="${ppy - 10}" width="9" height="11" rx="1.5"
            fill="#2a2c2e" stroke="#606468" stroke-width="1"/>
      <path id="climPortFlap" d="M ${ppx + 4} ${ppy - 25} L ${ppx - 4} ${ppy - 12} L ${ppx + 11} ${ppy - 16} Z"
            fill="#c62f36" stroke="#7e1f24" stroke-width="1" stroke-linejoin="round"/>
      <circle id="climGlow" cx="${ppx}" cy="${ppy}" r="4" fill="#d53a3a">
        <animate attributeName="opacity" values="1;.45;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </g>    ${heatWaves("seatFL", A.fl[0], A.fl[1], car.climate_squish_fix || 1.0, car.climate_icon_scale || 1.0)}
    ${heatWaves("seatFR", A.fr[0], A.fr[1], car.climate_squish_fix || 1.0, car.climate_icon_scale || 1.0)}
    ${heatWaves("seatRL", A.rl[0], A.rl[1], car.climate_squish_fix || 1.0, car.climate_icon_scale || 1.0)}
    ${heatWaves("seatRR", A.rr[0], A.rr[1], car.climate_squish_fix || 1.0, car.climate_icon_scale || 1.0)}
    <g id="wheelHeat" class="tapa" style="cursor:pointer">
      <circle cx="${A.wheel[0]}" cy="${A.wheel[1]}" r="26" fill="#000" opacity="0"/>
      <g transform="translate(${A.wheel[0]}, ${A.wheel[1]}) scale(${(car.climate_squish_fix || 1.0) * (car.climate_icon_scale || 1.0)}, ${car.climate_icon_scale || 1.0}) translate(${-A.wheel[0]}, ${-A.wheel[1]})">
        <g id="wheelHeatIcon" transform="translate(${A.wheel[0] - 17},${A.wheel[1] - 17}) scale(1.42)">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C15.72,4 18.85,6.55 19.74,10H4.26C5.15,6.55 8.28,4 12,4M12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14M4.26,14H8.09L11,17V19.93C7.55,19.5 4.79,17.06 4.26,14M15.91,14H19.74C19.21,17.06 16.45,19.5 13,19.93V17L15.91,14Z"
              fill="#a9adb2"/>
      </g>
      <path id="wheelHeat_w0" d="M ${A.wheel[0] - 5} ${A.wheel[1] - 15} q 3.4 -2.6 0 -5.2 q -3.4 -2.6 0 -5.2"
            stroke="#a9adb2" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path id="wheelHeat_w1" d="M ${A.wheel[0] + 5} ${A.wheel[1] - 15} q 3.4 -2.6 0 -5.2 q -3.4 -2.6 0 -5.2"
            stroke="#a9adb2" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      </g>
      <text id="wheelHeat_auto" x="${A.wheel[0]}" y="${A.wheel[1] + 25}" text-anchor="middle"
            font-size="10.5" font-weight="700" fill="#a9adb2" style="display:none">Auto</text>
    </g>
    <g id="heatToast" style="display:none">
      <rect id="heatToastBg" x="0" y="0" rx="6" height="24" width="90" fill="#000000d0"/>
      <text id="heatToastTxt" x="0" y="0" font-size="13.5" font-weight="600" fill="#f2f3f4"></text>
    </g>
  </svg>
</div>
<div class="climPage">
  <svg class="climCableLayer" id="climCableLayer" preserveAspectRatio="none" aria-hidden="true">
    <g id="climCableLiveGroup" style="display:none">
      <path id="climCableLive" d="" stroke="#3f6db5" stroke-opacity=".72" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path id="climCableDashLive" d="" pathLength="100" stroke="#3aa869" stroke-opacity=".72" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="12 38" style="display:none">
        <animate attributeName="stroke-dashoffset" from="0" to="100" dur="2s" repeatCount="indefinite"/>
      </path>
      <path id="climBolt" transform="translate(0 0) scale(.6)"
            d="M10 0 L 0 17 h 7 l -3.5 14 l 12 -19 h -7 l 5 -12 z" fill="#4fd07a" style="display:none"/>
    </g>
  </svg>
  <div class="climTemps" id="climTemps">-</div>
  <div class="climLeft" style="bottom:${Number.isFinite(Number(car.climate_left_bottom)) && car.climate_left_bottom !== "" && car.climate_left_bottom !== null ? Number(car.climate_left_bottom) : (this._st("cop") ? 132 : 12)}px">
  <div class="climExtrasOverlay">
    <div class="climCtl">
      <button class="pwr" id="climPwr">${svgIcon(ICONS.power)}<span id="climPwrLb">Off</span></button>
      <div class="climTempAdjust"><button class="arrow" id="tDn" aria-label="Lower target temperature">‹</button>
        <span class="big" id="tTgt">-</span><button class="arrow" id="tUp" aria-label="Raise target temperature">›</button></div>
      <button class="pwr" id="climVent">${svgIcon(ICONS.vent)}<span>Vent</span></button>
    </div>
    <div class="climModesBlock">
      <button class="defrostBtn climX" id="btnDefrost">${climIcon(CLIM_GLYPH.defrost)}Defrost Car</button>
      ${this._climModeButtonsHtml()}
    </div>
  </div>
  </div>
  <button type="button" class="backBtn" id="ctlBack" title="Back"><svg class="backChevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 5 L8.5 12 L15.5 19"/></svg></button>

  ${this._climExtraHtml()}
</div>`;
    }

    /* Bioweapon / Camp / Pet buttons are drawn over the lower-right of the
       climate photo, leaving the charging cable visible and avoiding added
       card height. Rendered only when the integration exposes the capability. */
    _climModeButtonsHtml() {
      const cs = this._st("climate");
      const fans = (cs && cs.attributes.fan_modes) || [];
      const presets = (cs && cs.attributes.preset_modes) || [];
      const has = (arr, v) => arr.some((o) => String(o).toLowerCase() === v);
      const hidden = (this._car.hide_climate || []).map((x) => String(x).toLowerCase());
      const shown = (this._car.show_climate || []).map((x) => String(x).toLowerCase());
      const show = (k) => shown.indexOf(k) >= 0 || hidden.indexOf(k) < 0;
      const model = String(this._car.model || "").toLowerCase().replace(/\s+/g, "");
      const isY = model.indexOf("modely") >= 0 || model === "y";
      const isSX = model.indexOf("models") >= 0 || model.indexOf("modelx") >= 0 ||
                   model === "s" || model === "x";
      const is3 = model.indexOf("model3") >= 0 || model === "3" || model.indexOf("m3") === 0;
      const yr = this._year();
      const hepa = shown.indexOf("bio") >= 0 || (!is3 &&
        !(isY && yr && yr < 2022) &&
        !(isSX && yr && yr < 2016));
      let html = "";
      if (has(fans, "bioweapon") && show("bio") && hepa)
        html += `<button class="defrostBtn climX" id="btnBio">${climIcon(`<path d="${ICONS.shield}"/>`)}Bioweapon Defense Mode</button>`;
      if (has(presets, "camp") && show("camp"))
        html += `<button class="defrostBtn climX" id="btnCamp">${climIcon(CLIM_GLYPH.tent)}Camp Mode</button>`;
      if (has(presets, "dog") && show("pet"))
        html += `<button class="defrostBtn climX" id="btnPet">${climIcon(CLIM_GLYPH.paw)}Pet Mode</button>`;
      return html;
    }

    _climExtraHtml() {
      const cop = this._st("cop");
      if (!cop) return "";
      let segs;
      if (cop.entity_id.startsWith("select.")) {
        segs = (cop.attributes.options || ["Off", "No A/C", "On"]).map((o) => [o, o]);
      } else {   // tesla_fleet exposes it as a climate entity
        segs = [["Off", "off"], ["No A/C", "fan_only"], ["On", "cool"]];
      }
      return `<div class="copWrap"><div class="copLbl">Cabin Overheat Protection</div>
        <div class="copSeg" id="copSeg">` +
        segs.map(([label, val]) => `<button data-cop="${val}">${label}</button>`).join("") +
        `</div></div>`;
    }
    _carSvg() {
      if (this._view === "map") return this._carMap();
      if (this._view === "clim") return this._carClim();
      if (this._resting()) return this._carRest();
      if (this._img("image")) return this._carImg();
      return this._carArt();
    }

    /* THE MAP VIEW. Home Assistant's Map dashboard is a strategy dashboard, so
       it is generated at runtime from every entity that has coordinates: there
       is no URL that centres it on one car and no zoom parameter. So rather
       than navigate anywhere, the card builds HA's OWN map card with a single
       entity and a zoom, and shows it in place of the photo.

       loadCardHelpers() is how every custom card that nests a built-in card
       gets at the factory. It is semi-public rather than documented, so every
       failure path here ends in a readable note plus the more-info dialog,
       which is what this row did before and is never worse than a blank box. */
    _carMap() {
      const id = this._car._entities && this._car._entities.location;
      if (!id) return '<div class="mapBox"><div class="mapNote">No location entity for ' +
        esc(this._car.name || "this car") + '.</div></div>';
      const st = this._st("location");
      const at = st && st.attributes;
      if (!at || typeof at.latitude !== "number" || typeof at.longitude !== "number")
        return '<div class="mapBox"><div class="mapNote">' + esc(this._car.name || "This car") +
          ' is not reporting coordinates right now. A sleeping car keeps its last known ' +
          'position; a car that has never reported one has nothing to show.</div></div>';
      this._mapWanted = id;
      return '<div class="mapBox" id="mapBox"></div>';
    }

    /* Built asynchronously, because loadCardHelpers() returns a promise. Called
       from _build after the DOM exists. Guarded so a stale promise landing
       after the user has moved on cannot inject a map into another view. */
    _mountMap() {
      const box = this.shadowRoot.getElementById("mapBox");
      const want = this._mapWanted;
      if (!box || !want) return;
      const zoom = Number(this._config && this._config.map_zoom);
      /* Two configs, richest first. HA card schemas are strict about unknown
         keys and theme_mode is a newer option, so an older frontend can reject
         the whole config over it. Falling back to the bare essentials keeps a
         working map on old and new alike, instead of a note explaining why
         there is no map. */
      const base = { type: "map", entities: [want], default_zoom: zoom > 0 ? zoom : 15 };
      const cfgs = [Object.assign({ aspect_ratio: "4x3", theme_mode: "dark" }, base), base];
      const fail = (why) => {
        if (this._view !== "map") return;
        box.innerHTML = '<div class="mapNote">The map could not be built in the card' +
          ' (' + esc(why) + '). Opening the usual dialog instead.</div>';
        this._moreInfo("location");
      };
      const helpers = window.loadCardHelpers && window.loadCardHelpers();
      if (!helpers || !helpers.then) return fail("no card helpers");
      helpers.then((h) => {
        if (this._view !== "map" || this._mapWanted !== want) return;
        if (!h || !h.createCardElement) return fail("no card factory");
        let el = null, last = "";
        for (let i = 0; i < cfgs.length && !el; i++) {
          try { el = h.createCardElement(cfgs[i]); }
          catch (e) { last = String((e && e.message) || e); }
        }
        if (!el) return fail(last || "no map card");
        el.hass = this._hass;
        this._mapEl = el;
        box.innerHTML = "";
        box.appendChild(el);
      }).catch((e) => fail(String((e && e.message) || e)));
    }

    /* Built-in fallback artwork - outlines traced 1:1 from reference photos of the
       real cars (Model 3 art currently shares the Model Y trace); the surface
       rendering is original. Tap/overlay anchors match the previous geometry. */
    /* No image pack for this model+paint. There used to be a full drawn car
       here as a fallback; it was removed deliberately - a hand-drawn car that
       is not quite your car reads as broken, and it quietly removed any reason
       to contribute a pack. Say what is missing, list what exists, recruit. */
    _carArt() {
      const car = this._car;
      const dir = /3/.test(String(car.model || "")) ? "3" : "y";
      const slug = String(car.paint || "").toLowerCase().replace(/[^a-z]/g, "");
      /* Qualify the suggested folder with the generation whenever the card knows
         it, which it usually does because the VIN gave it the model year. The
         unqualified folder is served to BOTH generations, so telling a Juniper
         owner to fill models/y/<paint>/app is telling them to create the exact
         wrong-bodywork problem this panel exists to end. */
      const gen = this._generation();
      const genDir = gen && GEN_LABEL[gen] ? dir + "-" + gen : dir;
      const path = "images/models/" + genDir + "/" + (slug || "&lt;paint&gt;") + "/app/";
      const have = PACKS_SHIPPED.map((p) =>
        `<li><b>${esc(p.model)}</b> &middot; ${esc(p.paint)}` +
        (p.gen ? ` &middot; ${esc(GEN_LABEL[p.gen] || p.gen)}` : "") + `</li>`).join("");
      return `
<div class="noPack">
  <svg class="noPackCar" viewBox="0 0 80 38" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 26 C6 17 14 11 27 10 C39 9 52 10 62 14 C70 17 73 21 72 27 C58 30 22 30 7 26 Z"/>
      <path d="M30 10 C33 3 43 2 48 6 C51 8 52 11 52 13"/>
      <circle cx="23" cy="31" r="5.2"/>
      <circle cx="57" cy="29" r="2.6"/>
      <path d="M2 35 L76 32"/>
      <path d="M45 30 L44 36 M50 30 L51 35"/>
    </g>
  </svg>
  <div class="noPackQuip">This project started as a vibecoding test, and somewhere along the way
    Nick said &ldquo;you drew a spaceship&rdquo; - we have come a long way since then, but the
    art side of the house needs your help.</div>
  <div class="noPackTitle">No image pack yet</div>
  <div class="noPackBody">Nothing bundled for <b>${esc(car.model || "this model")}</b>
    in <b>${esc(car.paint || "no paint set")}</b>. Everything else on this card works -
    only the picture is missing.</div>
  <div class="noPackHave">Packs that ship today:<ul>${have}</ul>
    Set <b>Model</b> and <b>Paint</b> to one of these to borrow its artwork.</div>
  <div class="noPackPath">${path}</div>
  <div class="noPackBody">A pack is seven photos from the Tesla app. If you own this car,
    you are the right person to build one -
    <a class="packCta" href="https://github.com/borgqueenx/sexy-home-assistant-tesla-card#contributing-an-image-pack" target="_blank" rel="noopener">contribute a pack</a>.</div>
</div>`;
    }


    _update() {
      const q = (id) => this.shadowRoot.getElementById(id);
      const isPlg = this._visualPlugged() && !this._forceDriveAnim();
      if (this._lastPlugged !== isPlg) {
         if (this._lastPlugged !== undefined) {
            this._lastPlugged = isPlg;
            if (this._climateDriveTimer || this._climateTransitionTarget) this._pendingRebuild = true;
            else {
              this._built = false;
              if (this._hass) this._build();
              return this._update();
            }
         }
         this._lastPlugged = isPlg;
      }

      /* Detection is all-or-nothing: miss the battery entity and NOTHING
         resolves, so the card used to render blank with no explanation of why
         (issue #1 - the reporter had no way to tell it was a prefix problem). */
      const dg = q("diag");
      if (dg) {
        const c0 = this._car;
        if (c0 && !c0._integration && this._hass) {
          const p = String(c0.prefix || "").replace(/[&<>"]/g, (m) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
          dg.innerHTML = "No Tesla entities found for prefix <b>" + (p || "(empty)") + "</b>. " +
            "This card looks for <code>sensor." + p + "battery</code> (Tesla Custom) or " +
            "<code>sensor." + p + "battery_level</code> (Tesla Fleet / Teslemetry). Open " +
            "<b>Developer tools &rarr; States</b>, find your car's battery sensor, and set the " +
            "prefix to everything between <code>sensor.</code> and <code>battery</code> " +
            "(including the trailing underscore).";
          dg.hidden = false;
        } else {
          dg.hidden = true;
        }
      }

      // battery line
      const pct = this._num("battery");
      const rng = this._num("range");
      const charging = this._charging();
      const bf = q("battFill");
      bf.style.width = Math.max(0, Math.min(100, pct || 0)) * 0.21 + "px";
      bf.className = "battFill" + (charging ? " chg" : pct !== null && pct <= 10 ? " crit" : pct !== null && pct <= 20 ? " low" : "");
      if (this._view === "clim") requestAnimationFrame(() => { this._positionClimateLayout(); this._placeBack(); this._updateClimateCable(); });
      q("battTxt").textContent =
        (pct === null ? "-" : Math.round(pct) + "%") +
        (rng === null ? "" : " · " + Math.round(rng) + " " + this._unit("range", "km"));

      // status — also check optional speed_entity sensor for driving detection
      const asleep = this._is("asleep", "on");
      const online = this._is("online", "on");
      const shiftS = this._st("shift");
      const shift = shiftS ? shiftS.state : "Park";
      /* speed_entity: if configured, treat speed > 1 as driving regardless of shift_state
         (useful when shift_state entity is unavailable or slow to update) */
      const car = this._car;
      const speedEnt = (car.speed_entity && this._hass && this._hass.states[car.speed_entity]) || this._st("speed");
      let speedEntVal = speedEnt ? parseFloat(speedEnt.state) : null;
      if (!Number.isFinite(speedEntVal)) speedEntVal = null;
      const speedEntityDriving = speedEntVal !== null && isFinite(speedEntVal) && speedEntVal > 1;
      let status, durKey;
      if (!online) { status = "Sleeping"; durKey = "online"; }
      else if (charging) { status = "Charging"; durKey = "charging"; }
      else if (asleep) { status = "Asleep"; durKey = "asleep"; }
      else if (shift === "D" || shift === "R" || shift === "N" || speedEntityDriving || this._lunaShiftDriving()) { status = "Driving"; durKey = "shift"; }
      else { status = "Parked"; durKey = "shift"; }
      const moving = status === "Driving" || this._forceDriveAnim();
      const luxEntity = String(car.lux_entity || "").trim();
      const luxState = luxEntity && this._hass && this._hass.states[luxEntity];
      const luxValue = luxState ? parseFloat(luxState.state) : NaN;
      const luxThreshold = parseFloat(car.lights_lux_below);
      const lightsOn = moving && (!luxEntity || (Number.isFinite(luxValue) && Number.isFinite(luxThreshold) && luxValue < luxThreshold));
      const durS = this._st(durKey);
      const dur = durS ? relDur(durS.last_changed) : "";
      let subTxt = status + (dur && dur !== "just now" ? " " + dur : "");
      if (charging) {
        const mins = this._minsToFull();
        if (!isNaN(mins) && mins > 0) {
          const h = Math.floor(mins / 60), m = Math.round(mins % 60);
          subTxt = (h ? h + "h " : "") + m + "m remaining";
        }
      }
      /* The app puts the running mode where the title goes, so you cannot miss
         it. The card's equivalent is this status line. Pet Mode on a parked car
         used to be invisible unless you opened the Climate view, which is a bad
         way to treat a mode whose whole job is keeping an animal safe. */
      const climS0 = this._st("climate");
      const pmode = String((climS0 && climS0.attributes.preset_mode) || "").toLowerCase();
      const MODE_LABEL = { dog: "Pet Mode", camp: "Camp Mode", keep: "Keep Climate On", defrost: "Defrosting" };
      if (MODE_LABEL[pmode]) subTxt = MODE_LABEL[pmode] + " \u00b7 " + subTxt;
      /* Keep driving duration on the status line; show the current speed on
         its own line between battery and duration. Prefer the configured or
         prefix-discovered speed sensor, then fall back to tracker speed. */
      let speedTxt = "";
      const showDrivingSpeed = status === "Driving" || this._forceDriveAnim();
      if (showDrivingSpeed) {
        let dspeed = null;
        if (speedEntVal !== null) {
          const unit = String((speedEnt && speedEnt.attributes && speedEnt.attributes.unit_of_measurement) || "").trim().toLowerCase();
          const displayUnit = /^(km\/h|kph|kmh)$/.test(unit) ? "km/h" :
                              /^(mph|mi\/h)$/.test(unit) ? "mph" : (this._imperial() ? "mph" : "km/h");
          dspeed = Math.round(speedEntVal) + " " + displayUnit;
        } else {
          dspeed = this._speed();
        }
        let etaTxt = "";
        if (car.eta_entity && this._hass && this._hass.states[car.eta_entity]) {
          const etaState = this._hass.states[car.eta_entity];
          const etaVal = etaState.state;
          if (etaVal && etaVal !== "unavailable" && etaVal !== "unknown") {
            etaTxt = " · ETA " + etaVal;
          }
        }
        if (dspeed !== null) speedTxt = "Speed: " + dspeed + etaTxt;
        else if (etaTxt) speedTxt = etaTxt.trim();
      }
      q("sub").textContent = subTxt;
      const speedLine = q("speedLine");
      if (speedLine) {
        speedLine.textContent = speedTxt;
        speedLine.classList.toggle("show", showDrivingSpeed && !!speedTxt);
      }
      const infoStackForStatus = q("infoStack");
      if (infoStackForStatus) infoStackForStatus.classList.toggle("drivingInfo", showDrivingSpeed);
      /* Move the battery and status into the lower-left of the car image only
         when the charging photo is the one this view is showing. */
      const infoStack = q("infoStack"), infoHome = q("infoHome"), carStage = q("carStage");
      const forceDrive = this._forceDriveAnim();
      const pluggedForInfo = this._visualPlugged() && !forceDrive;
      const pluggedPhoto = pluggedForInfo && (this._img("image_side_plugged") || this._img("image_charging"));
      const chargingPhoto = this._view !== "clim" && this._resting() && !forceDrive && ((charging && this._img("image_charging")) || pluggedPhoto);
      if (infoStack && infoHome && carStage) {
        const card = this.shadowRoot.querySelector("ha-card");
        if (card) card.classList.toggle("chargeInfoMoved", chargingPhoto);
        const positionChargeInfo = () => {
          if (infoStack.parentElement !== carStage) return;
          const restWrap = q("restWrap");
          if (!restWrap) return;
          const stageRect = carStage.getBoundingClientRect();
          const imageRect = restWrap.getBoundingClientRect();
          const carBox = q("carBox");
          let carTranslateY = 0;
          if (carBox) {
            const transform = getComputedStyle(carBox).transform;
            const matrix = transform && transform.match(/^matrix(3d)?\(([^)]+)\)$/);
            if (matrix) {
              const parts = matrix[2].split(",").map(Number);
              carTranslateY = matrix[1] ? (parts[13] || 0) : (parts[5] || 0);
            }
          }
          const visualBottom = imageRect.bottom - carTranslateY;
          infoStack.style.top = `${Math.round(visualBottom - stageRect.top - infoStack.offsetHeight - 4)}px`;
        };
        this._positionChargeInfo = positionChargeInfo;
        if (chargingPhoto && infoStack.parentElement !== carStage) carStage.appendChild(infoStack);
        else if (!chargingPhoto && infoStack.parentElement !== infoHome) infoHome.appendChild(infoStack);
        if (chargingPhoto) requestAnimationFrame(positionChargeInfo);
        else infoStack.style.removeProperty("top");
      }
      /* Built here rather than in _build so the animation speed can follow
         the car. SMIL will not pick up a changed dur on a running animation,
         so the tier change is a re-render of this one element; it happens
         only when the car crosses the threshold. Clearing it while parked
         also stops six copies of the pack photo animating out of sight. */
      /* the nested map card is a live HA card: it needs every hass update, or
         the marker freezes where the car was when the view opened */
      if (this._mapEl && this._view === "map") this._mapEl.hass = this._hass;
      const dOvl = q("driveOvl");
      if (dOvl) {
        /* "still" is a car in gear that is not moving - stopped at a junction.
           It keeps its road and its wheels and loses the motion, because a
           sliding road under a stationary car is the thing Nick spotted:
           "At 0, the animation should stop." */
        const dsrc = dOvl.getAttribute("data-src") || "";
        const rd = this._road(dsrc);
        const kph = this._speedKph();
        const scale = Number(this._config && this._config.drive_speed) || 1;
        /* a pack may carry its own reference cycle; drive_speed scales it */
        const ref = (rd && rd.cycle > 0 ? rd.cycle : DRIVE.refCycle) /
                    (scale > 0 ? scale : 1);
        let cyc = 0;
        const forceAnimOnly = this._car.force_drive_anim === true;
        if (moving && (kph !== 0 || forceAnimOnly)) {
          const v = kph === null || (kph === 0 && forceAnimOnly) ? DRIVE.refKph : kph;
          cyc = ref * DRIVE.refKph / v;
          cyc = Math.min(DRIVE.maxCycle, Math.max(DRIVE.minCycle, cyc));
          cyc = Math.round(cyc * 100) / 100;
        }
        /* the tier key is the cycle itself, so the overlay is rebuilt when
           the speed actually changes the animation and not otherwise */
        const tier = !moving ? "off" : cyc > 0 ? "c" + cyc.toFixed(2) : "still";
        if (tier !== this._driveTier) {
          this._driveTier = tier;
          if (tier === "off") dOvl.innerHTML = "";
          else {
            const dsfx = dOvl.getAttribute("data-sfx") || "Rest";
            const box = this._carBox(dsrc, dsfx);
            const cwv = (box && box.length === 4 && box[2] > box[0]) ? box[2] - box[0] : 233 * 0.71;
            const wh = this._wheels(dsrc);
            const wdur = cyc > 0 ? wheelPeriod(wh, cwv, cyc, rd && rd.angle) : 0;
            const wasHidden = dOvl.style.display === "none";
            if (wasHidden) dOvl.style.display = "";
            const cardRect = this.shadowRoot.querySelector("ha-card")?.getBoundingClientRect();
            const ovlRect = dOvl.getBoundingClientRect();
            const vb = (dOvl.getAttribute("viewBox") || "-50 0 283 108").split(/\s+/).map(Number);
            const viewScale = ovlRect.width && vb[2] ? ovlRect.width / vb[2] : 0;
            const edgeBounds = cardRect && viewScale ? {
              left: vb[0] + (cardRect.left - ovlRect.left) / viewScale,
              right: vb[0] + (cardRect.right - ovlRect.left) / viewScale
            } : null;
            if (wasHidden) dOvl.style.display = "none";
            dOvl.innerHTML =
              driveRoad(233, 108, box, rd, cyc > 0 ? +cyc.toFixed(3) : 0, edgeBounds) +
              driveWheels(wh, dsrc, wdur ? +wdur.toFixed(3) : 0);
          }
        }
        dOvl.style.display = moving ? "" : "none";
        const hL = q("headlights");
        const flashAllowed = this._flashEffectAllowed();
        if (!flashAllowed && this._flashUntil) {
          clearTimeout(this._flashTimer);
          this._flashTimer = null;
          this._flashUntil = 0;
        }
        const flashActive = flashAllowed && Date.now() < (this._flashUntil || 0);
        if (hL) hL.style.display = (lightsOn || flashActive) ? "" : "none";
        const dL = q("daylights");
        if (dL) dL.style.display = moving ? "" : "none";
        const restWrap = q("restWrap");
        if (restWrap) restWrap.classList.toggle("driving", moving);
      }

      // on-car states
      const locked = this._is("lock", "locked");
      const frunkOpen = this._visualFrunkOpen();
      const trunkOpen = this._visualTrunkOpen();
      if (!this._arm.frunk) {
        const fl = q("frunkLbl");
        if (fl) { fl.textContent = frunkOpen ? "Close" : "Open"; fl.style.fill = frunkOpen ? "#e0a63c" : ""; }
      }
      if (!this._arm.rfrunk) {
        const rfl = q("restFrunkLbl");
        if (rfl) { rfl.textContent = frunkOpen ? "Close" : "Frunk"; rfl.style.fill = frunkOpen ? "#e0a63c" : ""; }
      }
      if (!this._arm.trunk) {
        const tl = q("trunkLbl");
        if (tl) { tl.textContent = trunkOpen ? "Close" : "Open"; tl.style.fill = trunkOpen ? "#e0a63c" : ""; }
      }
      if (!this._arm.rtrunk) {
        const rtl = q("restTrunkLbl");
        if (rtl) { rtl.textContent = trunkOpen ? "Close" : "Trunk"; rtl.style.fill = trunkOpen ? "#e0a63c" : ""; }
      }
      const lockBtn = q("aLock");
      if (lockBtn) {
        const lockUnlocked = this._is("lock", "unlocked");
        const lockKnown = locked || lockUnlocked;
        const lockLabel = locked ? "Locked" : lockUnlocked ? "Unlocked" : "Unavailable";
        const lockText = lockBtn.querySelector(".lb");
        if (lockText && !this._arm.mainLock) lockText.textContent = lockLabel;
        const lockPath = lockBtn.querySelector("svg path");
        if (lockPath) lockPath.setAttribute("d", ICONS[locked ? "lock" : "unlock"]);
        lockBtn.classList.toggle("locked", locked);
        lockBtn.disabled = !lockKnown;
        if (!this._arm.mainLock) lockBtn.setAttribute("aria-label", lockLabel);
      }
      /* Keep the frunk and trunk hotspots on the car; lock is in the centered action bar. */
      ["restFrunkBtn","restTrunkBtn"].forEach((id) => {
        const el = q(id); if (el) el.style.display = moving ? "none" : "";
      });
      const plugged = this._visualPlugged() && !this._forceDriveAnim();
      const portOpen2 = this._is("charge_port", "open");
      const bolt = q("boltP");
      if (bolt) {
        bolt.style.display = plugged ? "" : "none";
        bolt.setAttribute("fill", charging ? "#4fd07a" : "#cfd2d5");
      }
      const nub = q("portNub");
      if (nub) nub.style.display = plugged ? "" : "none";
      const flap = q("portFlap");
      if (flap) flap.style.display = plugged || portOpen2 ? "" : "none";
      const se = q("sentryEye");
      if (se) se.style.display = this._is("sentry", "on") ? "" : "none";
      q("battTxt").style.color = charging ? "#4fd07a" : "";
      const bakedC = this._cableBaked();
      const rOvl = q("restChgOvl");
      if (rOvl) {
        /* baked: dashes only, and only while actually charging (plugged-but-idle
           has nothing to animate). Unbaked keeps the drawn cable on both. */
        rOvl.style.display = moving ? "none" :
                             ((bakedC ? charging
                                     : (charging || plugged) && !this._img("image_charging")) ? "" : "none");
        const rc = q("restCable");
        if (rc) rc.setAttribute("stroke", charging ? "#2f7a49" : "#3f6db5");
        const rd = q("restCableDash");
        if (rd) rd.style.display = charging ? "" : "none";
        const rcg = q("restCableGlow");
        if (rcg) rcg.style.display = charging ? "" : "none";
        const rbolt = q("restCableBolt");
        if (rbolt) {
          rbolt.style.display = charging ? "" : "none";
          rbolt.setAttribute("fill", "#4fd07a");
        }
        const rg = q("restGlow");
        if (rg) rg.style.display = charging ? "" : "none";
      }
      const ri = q("restImg");
      if (ri) {
        let rsrc = moving ? this._img("image_side") :
                     ((charging && this._img("image_charging")) ||
                     (plugged && (this._img("image_side_plugged") || this._img("image_charging"))) ||
                     this._img("image_side"));
        if (rsrc) {
          ri.dataset.basesrc = rsrc;
          const fo = this._visualFrunkOpen();
          const to = this._visualTrunkOpen();
          if (!this._failedImgs) this._failedImgs = new Set();
          const openSuffix = fo && to ? "frunktrunkopen" : fo ? "frunkopen" : to ? "trunkopen" : "";
          const variantFor = (source) => source.replace(/(\.(?:jpe?g|png))(?=([?#]|$))/i, `-${openSuffix}$1`);
          const openCandidates = [];
          if (openSuffix && !moving) {
            const openBases = charging && plugged
              ? [this._img("image_charging"), this._img("image_side_plugged"), this._img("image_side")]
              : plugged
                ? [this._img("image_side_plugged"), this._img("image_charging"), this._img("image_side")]
                : [this._img("image_side")];
            for (const base of openBases) {
              if (!base) continue;
              const candidate = variantFor(base);
              if (!openCandidates.includes(candidate)) openCandidates.push(candidate);
            }
            ri._openVariantCandidates = openCandidates;
            const preferred = openCandidates.find((candidate) => !this._failedImgs.has(candidate));
            if (preferred) rsrc = preferred;
          } else {
            ri._openVariantCandidates = [];
          }

          if (ri.getAttribute("src") !== rsrc) {
             ri.setAttribute("src", rsrc);

             ri.onload = () => {
               const wrap = ri.closest(".imgWrap");
               if (wrap) {
                 const isOpen = fo || to;
                 if (isOpen && ri.naturalHeight && ri.naturalHeight > 400) {
                   const scale = (ri.clientWidth || 280) / 660;
                   const shift = (ri.naturalHeight - 400) * scale;
                   wrap.style.transform = `translateY(-${shift}px)`;
                   wrap.style.marginBottom = `-${shift}px`;
                 } else {
                   wrap.style.transform = '';
                   wrap.style.marginBottom = '';
                 }
               }
               if (this._positionChargeInfo) requestAnimationFrame(this._positionChargeInfo);
             };
              ri.onerror = () => {
                const failedSrc = ri.getAttribute("src");
                if (this._failedImgs) this._failedImgs.add(failedSrc);
                const nextVariant = (ri._openVariantCandidates || []).find((candidate) =>
                  candidate !== failedSrc && !this._failedImgs.has(candidate));
                if (nextVariant) ri.setAttribute("src", nextVariant);
                else if (failedSrc !== ri.dataset.basesrc) ri.setAttribute("src", ri.dataset.basesrc);
              };
          } else {
             /* src unchanged (image cached) — still sync the transform in case
                the card rebuilt (e.g. unplug event) and lost the inline style */
             const wrap = ri.closest(".imgWrap");
             if (wrap) {
               const isOpen = fo || to;
               if (!isOpen) {
                 wrap.style.transform = '';
                 wrap.style.marginBottom = '';
               } else if (!wrap.style.transform && ri.naturalHeight > 400) {
                 const scale = (ri.clientWidth || 280) / 660;
                 const shift = (ri.naturalHeight - 400) * scale;
                 wrap.style.transform = `translateY(-${shift}px)`;
                 wrap.style.marginBottom = `-${shift}px`;
               }
             }
          }
          /* Sync the imgWrap margin-top so the car body aligns the same
             way in both plugged and unplugged state. The two source images
             have the car body starting at different Y positions:
               side-plugged.jpg: car top at y≈41 (more space at top)
               side.jpg:         car top at y≈18 (less space at top)
             Unplugged needs ~17px LESS upward pull to keep the visible car body
             at the same height as the plugged view. */
          const wrap2 = ri.closest(".imgWrap");
          if (wrap2 && !fo && !to) {
            wrap2.style.marginTop = plugged ? "" : "-58px";
          }
        }
      }
      this._positionRestFrunkHit();
      const ti = q("topImg");
      if (ti) {
        const tsrc = (charging && this._img("image_top_charging")) ||
                     (plugged && this._img("image_top_plugged")) ||
                     this._img("image");
        if (tsrc && !ti.getAttribute("src").endsWith(tsrc)) ti.setAttribute("src", tsrc);
      }
      const bpulse = q("boltPulse");
      if (bpulse) bpulse.style.display = charging ? "" : "none";
      const previewPlugged = this._car.force_plugged === true;
      ["aPort", "cLim", "ampUp", "ampDn", "btnStopChg", "btnUnlockPort"].forEach((id) => {
        const el = q(id); if (el) el.disabled = previewPlugged;
      });
      const cBtns = q("chgBtns");
      if (cBtns) {
        const portOpen = this._is("charge_port", "open");
        const stopB2 = q("btnStopChg");
        const portB2 = q("btnUnlockPort");
        cBtns.classList.toggle("show", charging || plugged || portOpen);
        if (stopB2) stopB2.style.display = charging ? "" : "none";
        if (portB2) {
          portB2.style.gridColumn = charging ? "" : "1 / -1";
          if (!this._arm.unlockChargePort && !this._arm.closeChargePort) {
            if (!charging && !plugged && portOpen) {
              portB2.textContent = "Close Charge Port";
              portB2.dataset.mode = "close";
            } else {
              portB2.textContent = "Unlock Charge Port";
              portB2.dataset.mode = "unlock";
            }
          }
        }
      }

      // tpms - tesla_custom reports psi, tesla_fleet reports bar
      if (this._config.show_tpms) {
        const u = this._unit("tpms_fl", "psi").toLowerCase();
        const isBar = u === "bar";
        const minWarn = isBar ? this._config.tpms_min / 14.5038 : this._config.tpms_min;
        [["tpFL", "tpms_fl"], ["tpFR", "tpms_fr"], ["tpRL", "tpms_rl"], ["tpRR", "tpms_rr"]].forEach(([id, key]) => {
          const v = this._num(key);
          const el = q(id);
          if (!el) return;
          el.textContent = v === null ? "" : (isBar ? v.toFixed(1) : Math.round(v)) + " " + u;
          el.style.fill = v !== null && v < minWarn ? "#e0a63c" : "#ececec";
        });
      }

      // action row states
      const vent = q("aVent");
      if (vent && !this._arm.vent) vent.classList.toggle("on", this._is("windows_cover", "open"));
      const sentryBtn = q("aSentry");
      if (sentryBtn) sentryBtn.classList.toggle("on", this._is("sentry", "on"));

      // climate row
      const climS = this._st("climate");
      const climOn = this._climOn();
      const inT = this._num("inside_temp");
      const outT = this._num("outside_temp");
      const climateSummary =
        (inT === null ? "" : "Interior " + Math.round(inT) + "°") +
        (outT === null ? "" : (inT === null ? "" : " · ") + "Exterior " + Math.round(outT) + "°");
      q("climSub").textContent = (climOn ? "On" : "Off") + (climateSummary ? " · " + climateSummary : "");
      const climFan = q("headClim") && q("headClim").querySelector(".climFan");
      if (climFan) climFan.classList.toggle("spin", !!climOn);
      const pwr = q("climPwr");
      if (pwr) {
        pwr.classList.toggle("on", !!climOn);
        q("climPwrLb").textContent = climOn ? "On" : "Off";
      }
      const tT = q("tTgt");
      if (tT) tT.innerHTML = climS && climS.attributes.temperature ? climS.attributes.temperature + '<span class="tDeg">°</span>' : "-";
      const ctTemps = q("climTemps");
      if (ctTemps) ctTemps.textContent =
        (inT === null ? "" : "Interior " + Math.round(inT) + "°C") +
        (outT === null ? "" : (inT === null ? "" : "\n") + "Exterior " + Math.round(outT) + "°C") || "-";
      const cVent = q("climVent");
      if (cVent) cVent.classList.toggle("on", this._is("windows_cover", "open"));
      const hideSeats = (this._car.hide_seats || []).map((x) => String(x).toLowerCase());
      /* Auto is a MODE, not a level. Measured off a screen recording of the
         app: on Auto the waves stay grey and the word "Auto" appears under
         the glyph. Colour means "you set this yourself" - red for heat, blue
         for cool - and the number of coloured waves is the level. */
      const paintHeat = (id, h) => {
        const g = q(id);
        if (!g) return;
        const col = h.mode === "cool" ? COOL_COL : HEAT_COL;
        const lit = h.mode === "auto" ? 0 : h.level;
        g.classList.toggle("heatOn", h.mode !== "off");
        for (let i = 0; i < 3; i++) {
          const w = q(id + "_w" + i);
          if (w) w.setAttribute("stroke", i < lit ? col : IDLE_COL);
        }
        const at = q(id + "_auto");
        if (at) {
          at.style.display = h.mode === "auto" ? "" : "none";
          at.setAttribute("fill", IDLE_COL);
        }
      };
      [["seatFL","seat_fl"],["seatFR","seat_fr"],["seatRL","seat_rl"],["seatRR","seat_rr"]].forEach(([id, key]) => {
        const g = q(id);
        if (!g) return;
        const s = this._st(key);
        // hide seats the integration doesn't expose, that are unavailable,
        // or that the car physically lacks (hide_seats: [rc] etc.)
        const hidden = !s || s.state === "unavailable" || s.state === "unknown" ||
                       hideSeats.includes(id.slice(4).toLowerCase());
        g.style.display = hidden ? "none" : "";
        if (hidden) return;
        let st = s.state || "off";
        if (this._pendSeat && this._pendSeat.key === key && Date.now() - this._pendSeat.ts < 12000) st = this._pendSeat.val;
        paintHeat(id, parseHeat(st));
      });
      if (q("wheelHeat")) {
        const wEnt = this._steerEnt();
        q("wheelHeat").style.display = wEnt ? "" : "none";
        const wh = parseHeat(wEnt && wEnt.state);
        const whOn = wh.mode !== "off";
        /* the app steps the wheel glyph through its levels the same way it
           steps the seats, so two waves here rather than three: a real car has
           two heat steps on the wheel, not three. */
        const wCol = wh.mode === "cool" ? COOL_COL : HEAT_COL;
        const wLit = wh.mode === "auto" ? 0 : Math.min(wh.level, 2);
        for (let i = 0; i < 2; i++) {
          const w = q("wheelHeat_w" + i);
          if (w) w.setAttribute("stroke", i < wLit ? wCol : IDLE_COL);
        }
        const wAuto = q("wheelHeat_auto");
        if (wAuto) {
          wAuto.style.display = wh.mode === "auto" ? "" : "none";
          wAuto.setAttribute("fill", IDLE_COL);
        }
        q("wheelHeat").classList.toggle("wheelOn", whOn);
        const wIc = q("wheelHeatIcon");
        if (wIc) wIc.querySelector("path").setAttribute("fill",
          wh.mode === "auto" ? IDLE_COL :
          whOn ? (wh.mode === "cool" ? COOL_COL : HEAT_COL) : IDLE_COL);
      }
      const dfOn = this._defrostOn();
      const dfB = q("btnDefrost");
      if (dfB) {
        dfB.classList.toggle("on", dfOn);
        dfB.classList.toggle("pending", this._pendVal("defrost") !== undefined);
      }
      const cpB = q("climPwr");
      if (cpB) cpB.classList.toggle("pending", this._pendVal("clim") !== undefined);
      const dfBadge = q("battDefrost");
      if (dfBadge) dfBadge.style.display = dfOn ? "" : "none";
      ["dfClim", "dfTop", "dfRest", "dfRestPlugged", "dfRestCharging"].forEach((gid) => {
        const gg = q(gid);
        if (gg) gg.style.display = dfOn ? "" : "none";
      });
      const haze = q("climHaze");
      /* the app does not draw vent mist while defrost is running */
      if (haze) haze.style.display = climOn && !dfOn ? "" : "none";
      /* The climate image is an interior view, so the exterior cable is always
         drawn as an overlay. Plug state shows the cable; charging animates its dash. */
      this._positionClimateLayout();
      this._updateClimateCable();
      const ccg = q("climCableG");
      const liveCable = q("climCableLiveGroup");
      if (ccg) {
        ccg.style.display = plugged ? "" : "none";
        if (liveCable) liveCable.style.display = plugged ? "" : "none";
        const cc = q("climCableLive");
        if (cc) cc.setAttribute("stroke", charging ? "#2f7a49" : "#3f6db5");
        const ccd = q("climCableDashLive");
        if (ccd) ccd.style.display = charging ? "" : "none";
        const cg = q("climGlow");
        if (cg) cg.setAttribute("fill", charging ? "#4fd07a" : plugged ? "#d53a3a" : "#6f6f6f");
        const cb = q("climBolt");
        if (cb) {
          cb.setAttribute("fill", charging ? "#4fd07a" : "#cfd2d5");
          cb.style.display = charging ? "" : "none";
        }
      }
      const pendVal = (p) => p && Date.now() - p.ts < 20000 ? p.val : null;
      const curPreset = String(pendVal(this._pendPreset) || (climS && climS.attributes.preset_mode) || "").toLowerCase();
      const curFan = String(pendVal(this._pendFan) || (climS && climS.attributes.fan_mode) || "").toLowerCase();
      const bioB2 = q("btnBio");
      if (bioB2) bioB2.classList.toggle("on", curFan === "bioweapon");
      const campB2 = q("btnCamp");
      if (campB2) campB2.classList.toggle("on", curPreset === "camp");
      const petB2 = q("btnPet");
      if (petB2) petB2.classList.toggle("on", curPreset === "dog");
      const copSeg2 = q("copSeg");
      if (copSeg2) {
        const cop = this._st("cop");
        const cur = String(pendVal(this._pendCop) || (cop && cop.state) || "").toLowerCase();
        copSeg2.querySelectorAll("button").forEach((b) =>
          b.classList.toggle("on", String(b.dataset.cop).toLowerCase() === cur));
      }

      // charging row
      const lim = this._num("charge_limit");
      const pw = this._num("charger_power");
      const eta = this._etaText();
      let chgSub;
      if (charging) chgSub = "Charging" + (pw ? " · " + pw + " kW" : "") + (eta ? " · done " + eta : "");
      else if (plugged) chgSub = "Charging Complete";
      else chgSub = "Unplugged" + (lim ? " · Limit " + Math.round(lim) + "%" : "");
      q("chgSub").textContent = chgSub;
      q("chgState").textContent = charging
        ? "  ·  Charging" + (pw ? " at " + pw + " kW" : "")
        : plugged ? "  ·  Charging Complete" : "";
      const ad = this._num("energy_added");
      if (charging) {
        const bits = [];
        if (pw !== null) bits.push(pw + " kW");
        if (ad !== null) bits.push("+" + ad + " kWh");
        const amS = this._st("charging_amps");
        if (amS) {
          const mx = amS.attributes.max;
          bits.push(Math.round(parseFloat(amS.state)) + (mx ? "/" + Math.round(mx) : "") + "A");
        }
        const volts = this._num("charger_voltage");
        if (volts !== null) bits.push(Math.round(volts) + "V");
        q("chgLine2").textContent = bits.join(" · ");
      } else {
        q("chgLine2").textContent = ad === null ? "" : ad + " kWh added during last charging session";
      }
      if (!this._limDrag && this.shadowRoot.activeElement !== q("cLim")) q("cLim").value = lim || 80;
      q("cLimVal").textContent = (lim ? Math.round(lim) : 80) + "%";
      const am = this._num("charging_amps");
      q("cAmp").textContent = am === null ? "-" : Math.round(am) + " A";
      const cbl = q("cableP");
      if (cbl) {
        cbl.style.display = plugged ? "" : "none";
        cbl.setAttribute("stroke", charging ? "#4fd07a" : "#4a9eff");
        cbl.setAttribute("stroke-dasharray", charging ? "10 8" : "");
      }
      const ap = q("aPort");
      if (ap) ap.classList.toggle("on", this._is("charge_port", "open") || plugged);

      // location row removed

      // footer
      const odo = this._num("odometer");
      /* "2024 Model 3 · 82,013 km". The year is decoded from the VIN, which
         the car reports itself, so nothing needs configuring. The VIN itself
         sits in the tooltip rather than on the face of the card: it identifies
         a specific vehicle and people screenshot their dashboards. show_vin
         puts it inline for anyone who wants it there. */
      /* If the photos are the wrong generation, say so on the image itself
         rather than letting the card quietly show the wrong car. A tooltip
         because the fallback is deliberate and usually fine: the alternative
         was a banner nagging about a difference most people will not mind. */
      const gm = this._genMismatch();
      const rImg = q("restImg");
      if (rImg) {
        if (gm) rImg.title = "These photos are the " + gm.got +
          " car; this one looks like the " + gm.want + ". Colour is matched, bodywork is not.";
        else rImg.title = "";
      }
      const yr = this._year();
      const vin = this._vin();
      const ident = yr ? String(yr) : "";
      const bits = [];
      if (ident.trim()) bits.push(ident.trim());
      if (odo !== null) bits.push(Math.round(odo).toLocaleString() + " " + this._unit("odometer", "km"));
      if (vin && this._config.show_vin) bits.push(vin);
      const odoEl = q("odo");
      odoEl.textContent = bits.join(" \u00b7 ");
      if (vin) odoEl.title = vin; else odoEl.removeAttribute("title");
      const lu = this._st("last_update");
      const rel = lu ? relDur(lu.state) : "";
      q("upd").textContent = rel ? (rel === "just now" ? "Updated just now" : "Updated " + rel + " ago") : "";

    }
  }

  class TeslaFleetCardEditor extends HTMLElement {
    setConfig(config) {
      const prev = this._config && this._config.cars;
      this._config = JSON.parse(JSON.stringify(config || {}));
      if (!Array.isArray(this._config.cars) || !this._config.cars.length) {
        this._config.cars = [{ name: "My Tesla", model: PACK_DEFAULT.model,
                               paint: PACK_DEFAULT.paint, prefix: "" }];
      }
      /* issue #1, the half that was missed in v1.1.0. Home Assistant feeds the
         config straight back into setConfig after every change the editor
         emits, and _render() replaces the whole shadow root - so that echo
         destroyed the very input being typed into and dropped focus, which
         reads as the editor jumping back to the first car. The DOM already
         matches a config we produced ourselves, so re-render only when the
         cars genuinely differ (first load, or an edit made in YAML). */
      if (this._rendered && stableStr(prev) === stableStr(this._config.cars)) return;
      this._rendered = true;
      this._render();
    }
    set hass(hass) {
      this._hass = hass;
      /* The Generation field depends on the VIN, which arrives with hass and
         may arrive after the first render. Re-render only when the answer
         actually changes, and never while something is focused: re-rendering
         under a focused input is exactly the issue #1 bug. */
      if (!this._rendered) return;
      const sig = this._ambSig();
      if (sig === this._ambLast) return;
      if (this.shadowRoot && this.shadowRoot.activeElement) return;
      this._render();
    }
    /* Only ask when the card genuinely cannot tell. The VIN gives the model
       year for every car, and the year settles the generation in every case but
       one: a 2023 Model 3. So this field appears on that car and no other,
       rather than adding a third dropdown to five cars that do not need one.
       No VIN yet means no question either - the card is not stuck, it just has
       not been told the year, and `generation` in YAML still overrides. */
    /* What the car says about itself, for the editor to show beside what the
       config claims. Everything here is read-only: the point is that you can
       see the card's own answer before deciding to override it. */
    _detected(car) {
      if (!this._hass || !car) return null;
      const vin = vinForPrefix(this._hass, car.prefix);
      if (!vin) return null;
      const yr = yearFromVin(vin);
      const md = modelFromVin(vin);
      return { vin: vin, year: yr, model: md,
               gen: genFromYear(md || car.model, yr),
               conflict: !!(md && car.model && !sameModel(md, car.model)) };
    }
    /* One line of plain English per car. A disagreement is called out as a
       disagreement, because a wrong model silently serves the wrong photos. */
    _detectedHint(car) {
      const d = this._detected(car);
      if (!d) return "No VIN yet, so nothing to detect. The card reads the model, "
                   + "year and generation off the VIN once the car reports one.";
      const bits = [];
      if (d.model) bits.push(esc(d.model));
      if (d.year) bits.push(String(d.year));
      if (d.gen) bits.push(esc(GEN_LABEL[d.gen] || d.gen));
      const seen = bits.length ? bits.join(" &middot; ") : "nothing conclusive";
      if (d.conflict)
        return '<b>The VIN says ' + esc(d.model) + ', but this is set to '
             + esc(car.model) + '.</b> Model picks the image pack and feeds the '
             + 'generation, so a wrong one serves the wrong car. Detected: ' + seen + '.';
      return "Detected from the VIN: " + seen
           + (car.model ? ", which matches." : ". Leave Model as &quot;-&quot; to use it.");
    }
    _ambiguous(car) {
      if (!this._hass || !car) return false;
      const yr = yearFromVin(vinForPrefix(this._hass, car.prefix));
      return !!yr && !genFromYear(car.model, yr);
    }
    /* Show the field where generation is actually in play: a car the VIN
       cannot decide, or a car somebody has already answered for. The second
       half matters - without it, picking a generation makes the car no longer
       ambiguous and the dropdown you just used disappears from under you. It
       also gives a way to clear a redundant key back to "-". */
    _showGen(car) {
      if (!car) return false;
      return !!(car.generation || car.gen) || this._ambiguous(car);
    }
    /* The re-render guard. It has to cover everything the panel derives from
       hass, not just the generation dropdown: a VIN arrives seconds after the
       editor opens, and without the detected line in here the hint would sit
       on "No VIN yet" for as long as the dialog stayed open. */
    _ambSig() {
      const cars = (this._config && this._config.cars) || [];
      return cars.map((c) => {
        const d = this._detected(c);
        return (this._showGen(c) ? "1" : "0")
             + (d ? ":" + (d.model || "") + "/" + (d.year || "") + "/" + (d.gen || "")
                        + (d.conflict ? "!" : "") : ":-");
      }).join("|");
    }
    _genOptions(car) {
      const m = String(car.model || "").toLowerCase().replace(/\s+/g, "");
      const isY = m.indexOf("modely") >= 0 || m === "y";
      return ["", isY ? "juniper" : "highland", "classic"];
    }
    _render() {
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this._ambLast = this._ambSig();
      let html = `
        <style>
          .car { border:1px solid var(--divider-color,#444); border-radius:8px; padding:8px 10px; margin:8px 0; }
          label { display:flex; justify-content:space-between; align-items:center; margin:5px 0; font-size:13px; gap:10px; }
          input, select { flex:1; max-width:60%; padding:4px 6px; }
          .rm { float:right; background:none; border:none; color:#c66; cursor:pointer; font-size:12px; }
          .add { margin-top:6px; cursor:pointer; }
          .hint { font-size:11.5px; color:var(--secondary-text-color,#999); margin-top:4px; }
          .hint.warn { color:var(--error-color,#e05c5c); }
        </style><div>`;
      this._config.cars.forEach((c, i) => {
        html += `<div class="car" data-i="${i}">
          <button class="rm" data-rm="${i}" ${this._config.cars.length < 2 ? "disabled" : ""}>remove</button>
          <label>Name <input data-i="${i}" data-k="name" value="${c.name || ""}"></label>
          <label>Model <select data-i="${i}" data-k="model">
            ${["", "Model 3", "Model Y"].map((m) => `<option value="${m}" ${((c.model || "") === m) ? "selected" : ""}>${m || "-"}</option>`).join("")}
          </select></label>
          <div class="hint ${this._detected(c) && this._detected(c).conflict ? 'warn' : ''}">${this._detectedHint(c)}</div>
          <label>Paint <select data-i="${i}" data-k="paint">
            ${["", "red", "grey", "silver", "white", "black", "blue"].map((p) => `<option value="${p}" ${((c.paint || "") === p) ? "selected" : ""}>${p || "-"}</option>`).join("")}
          </select></label>
          <label>Entity prefix <input data-i="${i}" data-k="prefix" value="${c.prefix || ""}" placeholder="e.g. buddy_"></label>
          <label>Sentry button <input type="checkbox" style="flex:none" data-i="${i}" data-k="show_sentry" ${c.show_sentry ? "checked" : ""}></label>
          ${this._showGen(c) ? `<label>Generation <select data-i="${i}" data-k="generation">
            ${this._genOptions(c).map((g) => `<option value="${g}" ${((c.generation || "") === g) ? "selected" : ""}>${g ? esc(GEN_LABEL[g] || g) : "-"}</option>`).join("")}
          </select></label>
          <div class="hint">${this._ambiguous(c)
            ? "This is the one case the VIN cannot settle: a 2023 Model&nbsp;3 could be either body, because Highland arrived in January 2024. Pick one and the card serves the right photos instead of guessing."
            : "The card can work this out from the VIN, so this is only here because your config sets it. Choose &quot;-&quot; to let it decide."}</div>` : ""}
          <div class="hint">Paint picks the image pack (e.g. Model&nbsp;3 + grey &rarr; models/3/grey). The integration is auto-detected from the prefix, and a missing trailing underscore is corrected for you. Advanced options - custom images, tap anchors, integration override, entity overrides - live in YAML (Show code editor); see the README.</div>
        </div>`;
      });
      html += `<button class="add" id="add">+ Add car</button></div>`;
      this.shadowRoot.innerHTML = html;
      this.shadowRoot.querySelectorAll("input, select").forEach((inp) =>
        inp.addEventListener("change", () => {
          const i = parseInt(inp.dataset.i, 10);
          const car = this._config.cars[i];
          if (inp.type === "checkbox") {
            /* off is the default, so it is the absence of the key */
            if (inp.checked) car[inp.dataset.k] = true; else delete car[inp.dataset.k];
          } else car[inp.dataset.k] = inp.value;
          /* issue #1: picking a paint did nothing, because a stored `color`
             (the old "+ Add car" always wrote blue) shadowed it at render time.
             The picker now CLEARS color rather than writing a hex, so the UI
             never produces one and `paint` stays the single source of truth.
             `color` survives only as a hand-written YAML override. */
          /* `color` is no longer read by the card; strip any left over from an
             older config so it does not sit there implying it still does. */
          if (inp.dataset.k === "paint") delete car.color;
          /* "-" means "work it out", which is the absence of the key rather
             than an empty string sitting in the YAML implying otherwise. */
          if (inp.dataset.k === "generation" && !inp.value) delete car.generation;
          this._emit();
        })
      );
      this.shadowRoot.querySelectorAll("[data-rm]").forEach((b) =>
        b.addEventListener("click", () => {
          this._config.cars.splice(parseInt(b.dataset.rm, 10), 1);
          this._render();
          this._emit();
        })
      );
      this.shadowRoot.getElementById("add").addEventListener("click", () => {
        /* no color here on purpose: a hard-coded one shadows the paint picker */
        /* default to a combination that actually has artwork, so a freshly
           added car looks right before anything else is filled in */
        this._config.cars.push({ name: "New car", model: PACK_DEFAULT.model,
                                 paint: PACK_DEFAULT.paint, prefix: "" });
        this._render();
        this._emit();
      });
    }
    _emit() {
      const cfg = Object.assign({ type: "custom:tesla-fleet-card" }, this._config);
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
    }
  }

  customElements.define("tesla-fleet-card", TeslaFleetCard);
  customElements.define("tesla-fleet-card-editor", TeslaFleetCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "tesla-fleet-card",
    name: "Sexy Tesla Card",
    description: "Tesla-app-style card for tesla_custom & tesla_fleet - multi-car, one-click switching",
    preview: true,
  });
  console.info(
    "%c TESLA-FLEET-CARD %c v" + CARD_VERSION + " ",
    "background:#e82127;color:#fff;font-weight:700;border-radius:4px 0 0 4px;padding:2px 0",
    "background:#333;color:#fff;border-radius:0 4px 4px 0;padding:2px 0"
  );
})();
