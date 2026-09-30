// ลำดับพื้นที่ทั้งเกม (ใช้ตัดสิน gate) · ชื่อพื้นที่ที่เกินความคืบหน้าจะไม่แสดงบนหน้าเว็บ
// เพิ่มพื้นที่ใหม่ต่อท้าย Act ของมันตามลำดับการเล่นจริง
window.DOS2_ACTS = [
  { act: 0, name: "บทนำ (Prologue)", areas: [
    { id: "prologue-ship", name: "เรือนักโทษ (Merryweather)" },
  ]},
  { act: 1, name: "Act 1", areas: [
    { id: "fort-joy-beach", name: "ชายหาด Fort Joy (Fort Joy Beach)" },
    { id: "fort-joy", name: "Fort Joy" },
    { id: "fort-joy-prison", name: "Fort Joy Prison" },
    { id: "hollow-marshes", name: "The Hollow Marshes" },
    { id: "sanctuary-of-amadia", name: "Sanctuary of Amadia" },
    { id: "vault-of-braccus-rex", name: "The Vault of Braccus Rex" },
    { id: "gargoyles-maze", name: "The Gargoyle's Maze" },
    { id: "braccus-rex-tower", name: "Braccus Rex's Tower" },
  ]},
  { act: 2, name: "Act 2", areas: [] },
  { act: 3, name: "Act 3", areas: [] },
  { act: 4, name: "Act 4", areas: [] },
];
