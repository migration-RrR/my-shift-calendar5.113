const brigadeCycles = {
  A:["day","night","rest","off"],
  B:["night","rest","off","day"],
  C:["rest","off","day","night"],
  D:["off","day","night","rest"]
};

let selectedBrigade = localStorage.getItem("brigade") || "A";

const calendarEl = document.querySelector(".calendar");
const todayBtn = document.getElementById("today-btn");
const dateInput = document.getElementById("date-input");
const checkBtn = document.getElementById("check-date");

const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const weekDays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

document.querySelectorAll(".brigade-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".brigade-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedBrigade = btn.dataset.brigade;
    localStorage.setItem("brigade", selectedBrigade);
    generateCalendar();
  });
});

document.querySelector(`[data-brigade="${selectedBrigade}"]`).classList.add("active");

function generateCalendar(){
  calendarEl.innerHTML = "";
  const year = new Date().getFullYear();
  const cycle = brigadeCycles[selectedBrigade];
  const today = new Date();

  for(let month=0; month<12; month++){

    let monthHours = 0;
    let monthShifts = 0;

    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    const title = document.createElement("h2");
    title.textContent = monthNames[month] + " " + year;
    monthDiv.appendChild(title);

    const weekHeader = document.createElement("div");
    weekHeader.className = "week-header";

    weekDays.forEach(d=>{
      const el = document.createElement("div");
      el.textContent = d;
      weekHeader.appendChild(el);
    });

    monthDiv.appendChild(weekHeader);

    const daysContainer = document.createElement("div");
    daysContainer.className = "days-container";

    const daysInMonth = new Date(year, month+1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    let offset = firstDay === 0 ? 6 : firstDay - 1;

    for(let i=0;i<offset;i++){
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      daysContainer.appendChild(empty);
    }

    for(let day=1; day<=daysInMonth; day++){
      const date = new Date(year, month, day);
      const diffDays = Math.floor((date - new Date(year,0,1)) / 86400000);
      const shift = cycle[diffDays % 4];

      if(shift === "day" || shift === "night"){
        monthHours += 11.5;
        monthShifts += 1;
      }

      const cell = document.createElement("div");
      cell.className = "day-cell " + shift;
      cell.textContent = day;

      const popup = document.createElement("div");
      popup.className = "shift-popup";
      popup.textContent = formatShift(shift);
      cell.appendChild(popup);

      cell.addEventListener("click", ()=>{
        document.querySelectorAll(".day-cell")
          .forEach(c => c.classList.remove("selected","show-popup"));

        cell.classList.add("selected","show-popup");
        cell.scrollIntoView({behavior:"smooth",block:"center"});
      });

      if(date.toDateString() === today.toDateString()){
        cell.classList.add("today");
      }

      daysContainer.appendChild(cell);
    }

    monthDiv.appendChild(daysContainer);

    const total = document.createElement("div");
    total.className = "month-total";
    total.innerHTML = `
      Итого часов: <strong>${monthHours}</strong> ч<br>
      Итого смен: <strong>${monthShifts}</strong>
    `;
    monthDiv.appendChild(total);

    calendarEl.appendChild(monthDiv);
  }
}

todayBtn.addEventListener("click", ()=>{
  const target = document.querySelector(".day-cell.today");
  if(target){
    document.querySelectorAll(".day-cell")
      .forEach(c => c.classList.remove("selected","show-popup"));

    target.classList.add("selected","show-popup");
    target.scrollIntoView({behavior:"smooth",block:"center"});
  }
});

checkBtn.addEventListener("click", ()=>{
  if(!dateInput.value) return;

  const d = new Date(dateInput.value + "T00:00");

  const monthDivs = document.querySelectorAll(".month");
  const targetMonth = monthDivs[d.getMonth()];
  const dayCells = targetMonth.querySelectorAll(".day-cell:not(.empty)");

  dayCells.forEach(c => c.classList.remove("selected","show-popup"));

  const targetDay = Array.from(dayCells)
    .find(c => parseInt(c.textContent) === d.getDate());

  if(targetDay){
    targetDay.classList.add("selected","show-popup");
    targetDay.scrollIntoView({behavior:"smooth",block:"center"});
  }
});

function formatShift(s){
  return s==="day"?"День":
         s==="night"?"Ночь":
         s==="rest"?"Отсыпной":"Выходной";
}

generateCalendar();
