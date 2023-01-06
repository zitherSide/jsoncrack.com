import { replaceInclude } from 'src/utils/yamlParser'

describe("VspecParser", () => {
  it("should replace #include", () => {
    const data = `
Mirrors:
  type: branch
  instances: ["Left", "Right"]
  description: All mirrors.
# Include mirrors specification and attach it to the Mirrors branch
#include ExteriorMirrors.vspec Mirrors`

    const ans = `
Mirrors:
  include_0: ExteriorMirrors.vspec
  type: branch
  instances: ["Left", "Right"]
  description: All mirrors.
# Include mirrors specification and attach it to the Mirrors branch`

    expect(replaceInclude(data)).toBe(ans)
  })

  it("should replace multiple #include", () => {
    const data = `
# (C) 2018 Volvo Cars
# (C) 2016 Jaguar Land Rover
#
# All files and artifacts in this repository are licensed under the
# provisions of the license provided by the LICENSE file in this repository.
#

#
# All body signals and attributes.
#

BodyType:
  datatype: string
  type: attribute
  description: Body type code as defined by ISO 3779.

RefuelPosition:
  datatype: string
  type: attribute
  allowed: ['FRONT_LEFT', 'FRONT_RIGHT', 'MIDDLE_LEFT', 'MIDDLE_RIGHT', 'REAR_LEFT', 'REAR_RIGHT']
  description: Location of the fuel cap or charge port.

#
# Hood description
#
Hood:
  type: branch
  description: Hood status.

Hood.IsOpen:
  datatype: boolean
  type: actuator
  description: Hood open or closed. True = Open. False = Closed.

#
# Trunk description
#
Trunk:
  type: branch
  instances: ["Front", "Rear"]
  description: Trunk status.

Trunk.IsOpen:
  datatype: boolean
  type: actuator
  description: Trunk open or closed. True = Open. False = Closed.

Trunk.IsLocked:
  datatype: boolean
  type: actuator
  description: Is trunk locked or unlocked. True = Locked. False = Unlocked.


#
# Horn description
#
Horn:
  type: branch
  description: Horn signals.

Horn.IsActive:
  datatype: boolean
  type: actuator
  description: Horn active or inactive. True = Active. False = Inactive.


#
# Raindetection description
#
Raindetection:
  type: branch
  description: Rainsensor signals.

Raindetection.Intensity:
  datatype: uint8
  type: sensor
  unit: percent
  max: 100
  description: Rain intensity. 0 = Dry, No Rain. 100 = Covered.


#
# Windshields description
#
Windshield:
  type: branch
  instances: ["Front", "Rear"]
  description: Windshield signals.
  
Windshield.Wiping:
  type: branch
  description: Windshield wiper signals.

Windshield.Wiping.Mode:
  datatype: string
  type: actuator
  allowed: ['OFF', 'SLOW', 'MEDIUM', 'FAST', 'INTERVAL', 'RAIN_SENSOR']
  description: Wiper mode requested by user/driver.
               INTERVAL indicates intermittent wiping, with fixed time interval between each wipe.
               RAIN_SENSOR indicates intermittent wiping based on rain intensity.

Windshield.Wiping.Intensity:
  datatype: uint8
  type: actuator
  description: Relative intensity/sensitivity for interval and rain sensor mode as requested by user/driver.
               Has no significance if Windshield.Wiping.Mode is OFF/SLOW/MEDIUM/FAST
               0 - wipers inactive.
               1 - minimum intensity (lowest frequency/sensitivity, longest interval).
               2/3/4/... - higher intensity (higher frequency/sensitivity, shorter interval).
               Maximum value supported is vehicle specific.

Windshield.Wiping.System:
  type: branch
  description: Signals to control behavior of wipers in detail.
               By default VSS expects only one instance.
  comment:     These signals are typically not directly available to the user/driver of the vehicle.
               The overlay in overlays/extensions/dual_wiper_systems.vspec can be used to modify this branch
               to support two instances; Primary and Secondary.

#include WiperSystem.vspec Windshield.Wiping.System

Windshield.Wiping.WiperWear:
  datatype: uint8
  type: sensor
  max: 100
  description: Wiper wear as percent.
               0 = No Wear.
               100 = Worn. Replacement required.
               Method for calculating or estimating wiper wear is vehicle specific.
               For windshields with multiple wipers the wear reported shall correspond to the most worn wiper.

Windshield.Wiping.IsWipersWorn:
  datatype: boolean
  type: sensor
  description: Wiper wear status. True = Worn, Replacement recommended or required. False = Not Worn.

Windshield.IsHeatingOn:
  datatype: boolean
  type: actuator
  description: Windshield heater status. False - off, True - on.

Windshield.WasherFluid:
  type: branch
  description: Windshield washer fluid signals

Windshield.WasherFluid.IsLevelLow:
  datatype: boolean
  type: sensor
  description: Low level indication for washer fluid. True = Level Low. False = Level OK.

Windshield.WasherFluid.Level:
  datatype: uint8
  unit: percent
  max: 100
  type: sensor
  description: Washer fluid level as a percent. 0 = Empty. 100 = Full.

##
#  Lights definition
##
Lights:
  type: branch
  description: All lights.

# Include lights specification and attach it to the Lights branch
#include ExteriorLights.vspec Lights


##
#  Mirrors definition
##
Mirrors:
  type: branch
  instances: ["Left", "Right"]
  description: All mirrors.
# Include mirrors specification and attach it to the Mirrors branch
#include ExteriorMirrors.vspec Mirrors

##
# Spoilers
##

RearMainSpoilerPosition:
  datatype: float
  unit: percent
  type: actuator
  min: 0
  max: 100
  description: Rear spoiler position, 0% = Spoiler fully stowed. 100% = Spoiler fully exposed.`

  })
})