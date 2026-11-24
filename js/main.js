/* 사이트 공통 설정 — 상호, 연락처는 여기 한 곳만 바꾸면 전체 페이지에 반영됩니다. */
const SITE = {
  name: "XPOTRAY",
  nameKo: "엑스포트레이",
  ceo: "대표 성함 입력",          // TODO: 대표 성함
  phone: "",                      // TODO: 예) 010-1234-5678 (비워두면 전화 버튼 숨김)
  email: "",                      // TODO: 문의 이메일
  kakao: "",                      // TODO: 카카오톡 오픈채팅 URL
  bizNo: "",                      // TODO: 사업자등록번호
};

const NAV = [
  ["index.html", "홈"],
  ["about.html", "회사소개"],
  ["services.html", "서비스"],
  ["automation.html", "AI 자동화"],
  ["diagnosis.html", "수익성 진단"],
  ["log.html", "오픈 일지"],
  ["contact.html", "상담 문의"],
];

function kakaoHref() { return SITE.kakao || "contact.html"; }

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const here = (location.pathname.split("/").pop() || "index.html");
  const links = NAV.map(([href, label]) =>
    `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  el.className = "site-header";
  el.innerHTML = `
    <div class="container">
      <a class="logo" href="index.html"><span class="logo-mark" aria-hidden="true">X</span>${SITE.name}</a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav">메뉴</button>
      <nav class="nav" id="nav" aria-label="주 메뉴">${links}
        <a class="btn btn-primary btn-sm" href="${kakaoHref()}">무료 상담</a>
      </nav>
    </div>`;
  const btn = el.querySelector(".menu-btn"), nav = el.querySelector(".nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "site-footer";
  const contact = [
    `대표: ${SITE.ceo}`,
    SITE.phone && `전화: <a href="tel:${SITE.phone}">${SITE.phone}</a>`,
    SITE.email && `이메일: <a href="mailto:${SITE.email}">${SITE.email}</a>`,
    SITE.bizNo && `사업자등록번호: ${SITE.bizNo}`,
  ].filter(Boolean).map(x => `<li>${x}</li>`).join("");
  el.innerHTML = `
    <div class="container">
      <div>
        <h4>${SITE.name} · ${SITE.nameKo}</h4>
        <p style="margin:0 0 8px">경매·공매로 싸게 사고, 고쳐서, 숙박과 임대로 채웁니다.<br>낙찰부터 운영까지 한 팀이 끝까지 책임지는 부동산 파트너.</p>
        <p style="margin:0">© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</p>
      </div>
      <div><h4>바로가기</h4><ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>
      <div><h4>Contact</h4><ul>${contact}</ul></div>
    </div>`;
}

function fillContacts() {
  document.querySelectorAll("[data-kakao]").forEach(a => { a.href = kakaoHref(); });
  document.querySelectorAll("[data-phone]").forEach(a => {
    if (SITE.phone) { a.href = `tel:${SITE.phone}`; a.textContent = a.dataset.phone.replace("{phone}", SITE.phone); }
    else (a.closest("[data-phone-wrap]") || a).remove();
  });
  document.querySelectorAll("[data-email]").forEach(a => {
    if (SITE.email) { a.href = `mailto:${SITE.email}`; a.textContent = SITE.email; }
    else a.closest("[data-email-wrap]")?.remove();
  });
}

/* 수익성 사전진단 계산기 */
function initCalc() {
  const form = document.getElementById("calc");
  if (!form) return;
  const $ = id => document.getElementById(id);
  const won = n => (isFinite(n) ? Math.round(n).toLocaleString("ko-KR") : "-") + "원";
  const pct = n => (isFinite(n) ? n.toFixed(1) : "-") + "%";

  function run() {
    const v = id => parseFloat(($(id).value || "0").replace(/,/g, "")) * 10000; // 만원 단위 입력
    const price = v("price");
    const repair = v("repair");
    const loanRate = (parseFloat($("loanRate").value) || 0) / 100;
    const ltv = (parseFloat($("ltv").value) || 0) / 100;
    const mode = $("mode").value;
    const adr = v("adr");               // 1박 단가 or 월세
    const occ = (parseFloat($("occ").value) || 0) / 100;
    const opex = v("opex");             // 월 운영비

    const tax = price * 0.046;          // 취득세·법무비 등 개략 4.6%
    const loan = price * ltv;
    const equity = price + repair + tax - loan;
    const monthlyRev = mode === "stay" ? adr * 30 * occ : adr;
    const fee = mode === "stay" ? monthlyRev * 0.15 : 0; // 플랫폼·청소 등 15%
    const interest = loan * loanRate / 12;
    const net = monthlyRev - fee - opex - interest;
    const roi = equity > 0 ? (net * 12) / equity * 100 : NaN;

    let score = 50 + roi * 2.2;
    score = Math.max(0, Math.min(100, score));
    $("score").textContent = isFinite(roi) ? Math.round(score) + "점" : "-";
    $("scoreBar").style.width = (isFinite(roi) ? score : 0) + "%";
    $("rEquity").textContent = won(equity);
    $("rRev").textContent = won(monthlyRev);
    $("rCost").textContent = won(fee + opex + interest);
    $("rNet").textContent = won(net);
    $("rRoi").textContent = pct(roi);
    $("verdict").textContent = !isFinite(roi) ? "값을 입력해 주세요."
      : roi >= 15 ? "투자금 대비 수익이 좋은 편입니다. 권리분석과 인허가 가능 여부만 확인되면 적극 검토할 만합니다."
      : roi >= 8 ? "무난한 수준입니다. 입찰가를 조금 낮추거나 운영비를 줄이면 수익률이 올라갑니다."
      : roi >= 0 ? "수익이 얇습니다. 입찰가, 리모델링 범위, 운영 방식을 다시 잡아야 합니다."
      : "현재 조건으로는 매달 손실이 납니다. 진입을 다시 생각해 보셔야 합니다.";
    $("adrLabel").textContent = mode === "stay" ? "1박 평균 객실 단가 (만원)" : "월 임대료 (만원)";
    $("occWrap").style.display = mode === "stay" ? "" : "none";
  }
  form.addEventListener("input", run);
  run();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader(); renderFooter(); fillContacts(); initCalc();
});
