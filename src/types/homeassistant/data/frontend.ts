
export enum ResourceKeys {
    todo = "todo",
    fan = "fan",
    ffmpeg = "ffmpeg",
    water_heater = "water_heater",
    shopping_list = "shopping_list",
    siren = "siren",
    media_player = "media_player",
    input_boolean = "input_boolean",
    input_text = "input_text",
    cover = "cover",
    input_number = "input_number",
    counter = "counter",
    scene = "scene",
    notify = "notify",
    light = "light",
    humidifier = "humidifier",
    person = "person",
    lovelace = "lovelace",
    time = "time",
    zone = "zone",
    update = "update",
    timer = "timer",
    persistent_notification = "persistent_notification",
    button = "button",
    group = "group",
    date = "date",
    recorder = "recorder",
    number = "number",
    text = "text",
    climate = "climate",
    demo = "demo",
    schedule = "schedule",
    script = "script",
    alarm_control_panel = "alarm_control_panel",
    device_tracker = "device_tracker",
    system_log = "system_log",
    logbook = "logbook",
    conversation = "conversation",
    image_processing = "image_processing",
    automation = "automation",
    input_datetime = "input_datetime",
    homeassistant = "homeassistant",
    datetime = "datetime",
    logger = "logger",
    vacuum = "vacuum",
    weather = "weather",
    switch = "switch",
    backup = "backup",
    frontend = "frontend",
    calendar = "calendar",
    cloud = "cloud",
    camera = "camera",
    input_button = "input_button",
    select = "select",
    tts = "tts",
    input_select = "input_select",
    lock = "lock",
    tag = "tag",
    event = "event",
    stt = "stt",
    air_quality = "air_quality",
    sensor = "sensor",
    binary_sensor = "binary_sensor",
    wake_word = "wake_word"
}

interface StateAttributes {
    [key: string]: {
        default: string;
        state?: {
            [key: string]: string;
        };
    };
}

interface Resource {
    default: string;
    state?: {
        [key: string]: string;
    };
    state_attributes?: {
        [key: string]: StateAttributes;
    };
    service?: string;
}

export type IconResources = {
    [key in ResourceKeys]: {
        _: Resource;
        [key: string]: Resource | undefined;
    };
}

export interface FrontendEntityComponentIconResources {
    resources: IconResources;
}
