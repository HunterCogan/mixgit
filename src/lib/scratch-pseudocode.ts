import type { Block } from "@/types";

function resolveInput(block: Block, key: string): string {
  const input = block.inputs[key];
  if (!input) return "?";
  const second = input[1];
  if (Array.isArray(second)) return String(second[1]);
  if (typeof second === "string") return "(expression)";
  return "?";
}

function field(block: Block, key: string): string {
  return block.fields[key]?.[0] ?? "?";
}

export function blockToLine(block: Block): string {
  const f = (k: string) => field(block, k);
  const i = (k: string) => resolveInput(block, k);

  switch (block.opcode) {
    case "event_whenflagclicked":
      return "when flag clicked:";
    case "event_whenkeypressed":
      return `when [${f("KEY_OPTION")}] key pressed:`;
    case "event_whenthisspriteclicked":
      return "when this sprite clicked:";
    case "event_whenstageclicked":
      return "when stage clicked:";
    case "event_whenbroadcastreceived":
      return `when I receive [${f("BROADCAST_OPTION")}]:`;
    case "event_broadcast":
      return `broadcast [${i("BROADCAST_INPUT")}]`;
    case "event_broadcastandwait":
      return `broadcast [${i("BROADCAST_INPUT")}] and wait`;
    case "control_wait":
      return `wait ${i("DURATION")} seconds`;
    case "control_repeat":
      return `repeat ${i("TIMES")}:`;
    case "control_forever":
      return "forever:";
    case "control_if":
      return "if (condition):";
    case "control_if_else":
      return "if (condition): ... else:";
    case "control_repeat_until":
      return "repeat until (condition):";
    case "control_while":
      return "while (condition):";
    case "control_stop":
      return `stop [${f("STOP_OPTION")}]`;
    case "control_start_as_clone":
      return "when I start as a clone:";
    case "control_create_clone_of":
      return `create clone of [${i("CLONE_OPTION")}]`;
    case "control_delete_this_clone":
      return "delete this clone";
    case "control_wait_until":
      return "wait until (condition)";
    case "motion_movesteps":
      return `move ${i("STEPS")} steps`;
    case "motion_turnright":
      return `turn right ${i("DEGREES")} degrees`;
    case "motion_turnleft":
      return `turn left ${i("DEGREES")} degrees`;
    case "motion_pointindirection":
      return `point in direction ${i("DIRECTION")}`;
    case "motion_pointtowards":
      return `point towards [${i("TOWARDS")}]`;
    case "motion_gotoxy":
      return `go to x: ${i("X")} y: ${i("Y")}`;
    case "motion_goto":
      return `go to [${i("TO")}]`;
    case "motion_glidesecstoxy":
      return `glide ${i("SECS")} secs to x: ${i("X")} y: ${i("Y")}`;
    case "motion_changexby":
      return `change x by ${i("DX")}`;
    case "motion_changeyby":
      return `change y by ${i("DY")}`;
    case "motion_setx":
      return `set x to ${i("X")}`;
    case "motion_sety":
      return `set y to ${i("Y")}`;
    case "motion_ifonedgebounce":
      return "if on edge, bounce";
    case "motion_setrotationstyle":
      return `set rotation style [${f("STYLE")}]`;
    case "looks_say":
      return `say [${i("MESSAGE")}]`;
    case "looks_sayforsecs":
      return `say [${i("MESSAGE")}] for ${i("SECS")} seconds`;
    case "looks_think":
      return `think [${i("MESSAGE")}]`;
    case "looks_thinkforsecs":
      return `think [${i("MESSAGE")}] for ${i("SECS")} seconds`;
    case "looks_show":
      return "show";
    case "looks_hide":
      return "hide";
    case "looks_switchcostumeto":
      return `switch costume to [${i("COSTUME")}]`;
    case "looks_nextcostume":
      return "next costume";
    case "looks_switchbackdropto":
      return `switch backdrop to [${i("BACKDROP")}]`;
    case "looks_nextbackdrop":
      return "next backdrop";
    case "looks_changesizeby":
      return `change size by ${i("CHANGE")}`;
    case "looks_setsizeto":
      return `set size to ${i("SIZE")}%`;
    case "looks_seteffectto":
      return `set [${f("EFFECT")}] effect to ${i("VALUE")}`;
    case "looks_changeeffectby":
      return `change [${f("EFFECT")}] effect by ${i("CHANGE")}`;
    case "looks_cleargraphiceffects":
      return "clear graphic effects";
    case "looks_goforwardbackwardlayers":
      return `go ${f("FORWARD_BACKWARD")} ${i("NUM")} layers`;
    case "sound_playuntildone":
      return `play sound [${i("SOUND_MENU")}] until done`;
    case "sound_play":
      return `start sound [${i("SOUND_MENU")}]`;
    case "sound_stopallsounds":
      return "stop all sounds";
    case "sound_changevolumeby":
      return `change volume by ${i("VOLUME")}`;
    case "sound_setvolumeto":
      return `set volume to ${i("VOLUME")}%`;
    case "data_setvariableto":
      return `set [${f("VARIABLE")}] to ${i("VALUE")}`;
    case "data_changevariableby":
      return `change [${f("VARIABLE")}] by ${i("VALUE")}`;
    case "data_showvariable":
      return `show variable [${f("VARIABLE")}]`;
    case "data_hidevariable":
      return `hide variable [${f("VARIABLE")}]`;
    case "data_addtolist":
      return `add ${i("ITEM")} to [${f("LIST")}]`;
    case "data_deleteoflist":
      return `delete ${i("INDEX")} of [${f("LIST")}]`;
    case "data_deletealloflist":
      return `delete all of [${f("LIST")}]`;
    case "data_insertatlist":
      return `insert ${i("ITEM")} at ${i("INDEX")} of [${f("LIST")}]`;
    case "data_replaceitemoflist":
      return `replace item ${i("INDEX")} of [${f("LIST")}] with ${i("ITEM")}`;
    case "sensing_askandwait":
      return `ask [${i("QUESTION")}] and wait`;
    case "sensing_resettimer":
      return "reset timer";
    case "sensing_setdragmode":
      return `set drag mode [${f("DRAG_MODE")}]`;
    case "procedures_definition":
      return `define ${block.mutation?.proccode ?? "custom block"}:`;
    case "procedures_call":
      return `call ${block.mutation?.proccode ?? "custom block"}`;
    default:
      return block.opcode.replace(/_/g, " ");
  }
}
