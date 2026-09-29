// ระบบซ่อนสปอยล์ + ตัวตั้งความคืบหน้า + เช็คลิสต์ (เก็บใน localStorage ของเบราว์เซอร์นี้เท่านั้น)
(function () {
  "use strict";
  var ACTS = window.DOS2_ACTS || [];
  var KEY_PROGRESS = "dos2guide:progress";
  var KEY_CHECK = "dos2guide:check:";
  var ALL = "*";          // area = "*" → ผ่านทั้ง Act แล้ว
  var UNKNOWN = 1e6;      // พื้นที่ที่ยังไม่อยู่ในรายการ → ถือว่าเกินเสมอ (ยกเว้นผ่านทั้ง Act)

  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, val) {
    try { if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val); } catch (e) {}
  }

  function actOf(n) { for (var i = 0; i < ACTS.length; i++) if (ACTS[i].act === n) return ACTS[i]; return null; }
  function areaIndex(act, area) {
    if (area === ALL) return Infinity;
    if (area === undefined || area === null || area === "") return -1;   // gate ระดับ Act
    var a = actOf(act); if (!a) return UNKNOWN;
    for (var i = 0; i < a.areas.length; i++) if (a.areas[i].id === area) return i;
    return UNKNOWN;
  }
  function areaName(act, area) {
    var a = actOf(act); if (!a) return area;
    for (var i = 0; i < a.areas.length; i++) if (a.areas[i].id === area) return a.areas[i].name;
    return area;
  }

  var first = ACTS.length && ACTS[0].areas.length ? { act: ACTS[0].act, area: ACTS[0].areas[0].id } : { act: 0, area: ALL };
  function getProgress() {
    try {
      var p = JSON.parse(load(KEY_PROGRESS));
      if (p && typeof p.act === "number" && actOf(p.act) && typeof p.area === "string") return p;
    } catch (e) {}
    return first;
  }
  function setProgress(p) { save(KEY_PROGRESS, JSON.stringify(p)); }

  // gate อยู่ภายในความคืบหน้าไหม
  function within(gAct, gArea, p) {
    if (gAct !== p.act) return gAct < p.act;
    return areaIndex(gAct, gArea) <= areaIndex(p.act, p.area);
  }

  // ---------- ตัวตั้งความคืบหน้า ----------
  function renderPicker(p) {
    var box = document.getElementById("progress");
    if (!box) return;
    box.innerHTML = "";
    var label = document.createElement("span");
    label.className = "plabel";
    label.textContent = "ความคืบหน้าของฉัน";
    var actSel = document.createElement("select");
    actSel.setAttribute("aria-label", "Act");
    ACTS.forEach(function (a) {
      var o = document.createElement("option");
      o.value = a.act; o.textContent = a.name;
      if (a.act === p.act) o.selected = true;
      actSel.appendChild(o);
    });
    var areaSel = document.createElement("select");
    areaSel.setAttribute("aria-label", "พื้นที่");
    function fillAreas(actNo) {
      areaSel.innerHTML = "";
      var a = actOf(actNo), cur = getProgress();
      var known = actNo < cur.act ? Infinity : actNo === cur.act ? areaIndex(cur.act, cur.area) : -1;
      a.areas.forEach(function (ar, i) {
        if (i > known + 1) return;                     // ไม่แสดงพื้นที่ที่ไกลกว่าพื้นที่ถัดไป
        var o = document.createElement("option");
        o.value = ar.id;
        o.textContent = i <= known ? ar.name : "➡ พื้นที่ถัดไป (ยังไม่เผยชื่อ)";
        if (actNo === cur.act && ar.id === cur.area) o.selected = true;
        areaSel.appendChild(o);
      });
      var all = document.createElement("option");
      all.value = ALL; all.textContent = "✔ ผ่านทั้ง " + a.name + " แล้ว";
      if (actNo === cur.act && cur.area === ALL) all.selected = true;
      areaSel.appendChild(all);
    }
    fillAreas(p.act);
    actSel.addEventListener("change", function () {
      var n = Number(actSel.value);
      fillAreas(n);
      if (n !== getProgress().act) areaSel.selectedIndex = 0;
      apply({ act: n, area: areaSel.value });
    });
    areaSel.addEventListener("change", function () { apply({ act: Number(actSel.value), area: areaSel.value }); });
    box.appendChild(label); box.appendChild(actSel); box.appendChild(areaSel);
  }

  // ---------- บล็อกที่มี gate ----------
  function gateText(act, area) {
    var a = actOf(act);
    return (a ? a.name : "Act " + act) + (area ? " · พื้นที่ที่คุณยังไม่ถึง" : "");
  }
  function renderGates(p) {
    var blocks = document.querySelectorAll("[data-act]");
    Array.prototype.forEach.call(blocks, function (el) {
      var act = Number(el.getAttribute("data-act"));
      var area = el.getAttribute("data-area") || "";
      var ok = within(act, area, p);
      var title = el.querySelector(":scope > .gtitle");
      var lock = el.querySelector(":scope > .glock");
      if (!lock) {
        lock = document.createElement("div");
        lock.className = "glock";
        var msg = document.createElement("span");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "เปิดดูบล็อกนี้";
        btn.addEventListener("click", function () {
          if (confirm("บล็อกนี้เกินความคืบหน้าที่ตั้งไว้ อาจมีสปอยล์ เปิดดูไหม?")) { el.classList.add("peek"); renderGates(getProgress()); }
        });
        lock.appendChild(msg); lock.appendChild(btn);
        el.insertBefore(lock, el.firstChild);
      }
      lock.firstChild.textContent = "🔒 เกินความคืบหน้าของคุณ (" + gateText(act, area) + ")";
      el.classList.toggle("locked", !ok);
      if (ok) el.classList.remove("peek");
      if (title) {
        var name = el.getAttribute("data-title") || (area ? areaName(act, area) : "");
        title.textContent = (ok || el.classList.contains("peek")) ? name : "พื้นที่ที่ยังไม่ถึง";
      }
    });
  }

  // ---------- ป้าย ⚠️สปอยล์ (ซ่อนเสมอ) ----------
  function renderSpoilers() {
    Array.prototype.forEach.call(document.querySelectorAll(".spoiler"), function (el) {
      if (el.querySelector(":scope > .sbtn")) return;
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "sbtn";
      btn.textContent = "⚠️สปอยล์ — กดเพื่อเปิด/ปิด";
      btn.addEventListener("click", function () { el.classList.toggle("open"); });
      el.insertBefore(btn, el.firstChild);
    });
  }

  // ---------- เช็คลิสต์ ----------
  function renderChecklists() {
    Array.prototype.forEach.call(document.querySelectorAll("ul.checklist[data-id]"), function (ul) {
      var id = ul.getAttribute("data-id");
      var items = ul.querySelectorAll(":scope > li[data-key]");
      var counter = document.createElement("p");
      counter.className = "ccount";
      function count() {
        var done = ul.querySelectorAll(":scope > li > label > input:checked").length;
        counter.textContent = "ทำแล้ว " + done + "/" + items.length;
      }
      Array.prototype.forEach.call(items, function (li) {
        if (li.querySelector("input")) return;
        var key = KEY_CHECK + id + ":" + li.getAttribute("data-key");
        var label = document.createElement("label");
        var box = document.createElement("input");
        box.type = "checkbox";
        box.checked = load(key) === "1";
        box.addEventListener("change", function () { save(key, box.checked ? "1" : null); count(); });
        label.appendChild(box);
        while (li.firstChild) label.appendChild(li.firstChild);
        li.appendChild(label);
      });
      ul.parentNode.insertBefore(counter, ul);
      count();
    });
  }

  function apply(p) { setProgress(p); renderPicker(p); renderGates(p); }

  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.classList.add("js");
    var p = getProgress();
    renderPicker(p); renderGates(p); renderSpoilers(); renderChecklists();
  });
})();
