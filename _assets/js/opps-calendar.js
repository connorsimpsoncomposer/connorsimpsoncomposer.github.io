window.buildIcsEvent = function (title, deadlineStr, url) {
  const dateParts = deadlineStr.split("-");
  const year = dateParts[0];
  const month = dateParts[1].padStart(2, "0");
  const day = dateParts[2].padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  return [
    "BEGIN:VEVENT",
    `UID:${title.replace(/\s+/g, "")}-${formattedDate}@composer-opps.com`,
    `DTSTAMP:${formattedDate}T000000Z`,
    `DTSTART;VALUE=DATE:${formattedDate}`,
    `SUMMARY:Deadline: ${title}`,
    `DESCRIPTION:Application Deadline for ${title}. View more info at: ${url}`,
    "END:VEVENT",
  ].join("\r\n");
};

window.downloadCalendarIcs = function (eventsArray, filename) {
  const icsStructure = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Composer Opps//NONSGML v1.0//EN",
    ...eventsArray,
    "END:VCALENDAR",
  ];

  const blob = new Blob([icsStructure.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `${filename.replace(/\s+/g, "_")}.ics`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};

window.exportAllFavoritesToCalendar = function () {
  const favorites =
    JSON.parse(localStorage.getItem("composer_opps_favorites")) || [];
  const events = [];

  favorites.forEach((id) => {
    const card = document.querySelector(`.opportunity-card[data-id="${id}"]`);
    if (!card) return;

    const title = card
      .querySelector(".opportunity-title")
      .childNodes[0].textContent.trim();
    const deadline = card.dataset.deadline;
    const url =
      window.location.origin +
      (card.querySelector("a")?.getAttribute("href") || "");

    events.push(window.buildIcsEvent(title, deadline, url));
  });

  if (events.length > 0) {
    window.downloadCalendarIcs(events, "My_Composer_Deadlines");
  }
};

window.getFavoritedData = function () {
  const favorites =
    JSON.parse(localStorage.getItem("composer_opps_favorites")) || [];
  if (favorites.length === 0) return [];

  return favorites
    .map((id) => {
      const card = document.querySelector(`.opportunity-card[data-id="${id}"]`);
      if (!card) return null;

      return {
        title:
          card.querySelector(".opportunity-title a")?.innerText.trim() ||
          "Untitled",
        deadline: card.dataset.deadline,
        category: card.dataset.category || "General",
        instrumentation: card.dataset.instrumentation || "Open",
        month: card.dataset.month || "Shortlist",
        location: card.dataset.location || "Online/TBA",
        faculty: card.dataset.faculty || "Not listed/NA",
        ensembles: card.dataset.ensembles || "Not listed/NA",
        tuition: card.dataset.tuition || "Not listed",
        funding: card.dataset.funding || "No info",
        applyWith: card.dataset.apply ? ` (${card.dataset.apply})` : "",
        url:
          card.dataset.moreInfo ||
          window.location.origin +
            (card.querySelector("a")?.getAttribute("href") || ""),
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

window.formatShortlistAsText = function (data) {
  const activeMode = window.OppState?.mode || "none";
  let output = "";

  const grouped = {};
  data.forEach((item) => {
    const key = activeMode === "none" ? "All" : item[activeMode] || "Other";
    (grouped[key] ||= []).push(item);
  });

  Object.entries(grouped).forEach(([groupTitle, items]) => {
    if (activeMode !== "none")
      output += `### ${groupTitle.toUpperCase()} ###\n\n`;

    items.forEach((item) => {
      output += `     ${item.title.toUpperCase()}\n`;
      output += `           ◆ ${item.deadline} | ${item.location}\n`;
      output += `           ◆ Faculty: ${item.faculty}\n`;
      output += `           ◆ Ensembles: ${item.ensembles}\n`;
      output += `           ◆ Instrumentation: ${item.instrumentation}${item.applyWith}\n`;
      output += `           ◆ Tuition: ${item.tuition} (${item.funding})\n`;
      output += `           → ${item.url}\n\n`;
    });
  });

  return output;
};

window.shareFavoritesEmail = function () {
  const data = window.getFavoritedData();
  if (data.length === 0) return;

  const emailBody = window.formatShortlistAsText(data);
  const subject = encodeURIComponent("Composition Opportunities Shortlist");
  const body = encodeURIComponent(emailBody);

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

window.copyFavoritesToClipboard = function () {
  const data = window.getFavoritedData();
  if (data.length === 0) return;

  const textOutput = window.formatShortlistAsText(data);
  const btn = document.getElementById("copy-favorites-clipboard");
  const btnText = btn?.querySelector(".btn-text");

  navigator.clipboard.writeText(textOutput).then(() => {
    if (!btnText) return;
    const originalText = btnText.textContent;
    btnText.textContent = "Copied!";
    setTimeout(() => {
      btnText.textContent = originalText;
    }, 2000);
  });
};
