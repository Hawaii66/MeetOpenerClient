const showChangeTable = document.querySelector("#ShowTable");
const changeTableForm = document.querySelector("#timetableForm");
const formErrorHandler = document.querySelector(".ErrorHandler");
//const loginForm = document.querySelector("#Login");
//const createTimeTableForm = document.querySelector("#CreateATimeTable");

//#region Server Urls
const localhost = "http://localhost:5000/";
const website_URL = "https://meetopenerserver.herokuapp.com/";
const MAIN_URL = localhost;
const GET_TIMETABLE_URL = MAIN_URL + "GetTimeTable";
const LOGIN_URL = MAIN_URL + "Login"
const CREATE_TIMETABLE_URL = MAIN_URL + "CreateTimeTable";
//#endregion

let accountName = "";
let accountPassword = "";

let clock = undefined;

ResetForms();

showChangeTable.addEventListener("submit", (event) => {
    event.preventDefault();
    TimeTableShowChange();
});

changeTableForm.addEventListener("submit", (event) => {
    event.preventDefault();
    ChangeTimeTable();
});
/*
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    Login();
});

createTimeTableForm.addEventListener("submit", (event) => {
    event.preventDefault();
    CreateNewTimeTable();
})
*/

function OpenAdmin() {
    window.open("https://youtube.com");
}

function CreateNewClassDiv() {
    event.preventDefault();
    CreateClassDiv();
}

function CreateNewTimeTable() {
    const formData = new FormData(createTimeTableForm);
    const name = formData.get("CreateTimeTableName");
    const password = formData.get("CreateTimeTablePassword");
    const oneMinuteBefore = formData.get("CreateTimeTableOneMinute");
    const lectures = [];

    const children = createTimeTableForm.querySelector("div").children;
    const childrenArray = Array.from(children);
    for (let i = 0; i < childrenArray.length; i++) {
        const childFormData = new FormData(childrenArray[i]);
        const Name = childFormData.get("LectureName");
        const Link = childFormData.get("LectureURL");
        const Time = childFormData.get("LectureTime");
        const Day = childFormData.get("LectureDay");
        const info = {
            url: Link,
            time: Time,
            day: Day,
            name: Name
        }
        lectures.push(info);
    }

    const finalData = {
        name,
        password,
        oneMinuteBefore,
        lectures
    }

    fetch(CREATE_TIMETABLE_URL, {
            method: "Post",
            body: JSON.stringify(finalData),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(newTimeTable => {
            //Sent timetable to server
        });
}

function Login() {
    const formData = new FormData(loginForm);
    const name = formData.get("LoginName");
    const password = formData.get("LoginPassword");
    const isCreating = formData.get("LoginIsCreating");

    const toSend = {
        name,
        password,
        isCreating
    }

    fetch(LOGIN_URL, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(login => {
            if (login.message === "ERROR") {
                return;
            }
            accountName = login.name;
            accountPassword = login.password;
        });
}

function TimeTableShowChange() {
    const formData = new FormData(showChangeTable);
    const newState = formData.get("showTimeTableChechBox");

    if (newState === "on") {
        changeTableForm.style.display = "";
    } else {
        changeTableForm.style.display = "none";
    }
}

function ResetForms() {
    showChangeTable.reset();
    changeTableForm.reset();
    changeTableForm.style.display = "none";
    formErrorHandler.querySelector("h2").textContent = "";
}

function ChangeTimeTable() {
    formErrorHandler.querySelector("h2").textContent = "";

    const formData = new FormData(changeTableForm);
    const name = formData.get("TimeTableName");
    const password = formData.get("TimeTablePassword");

    clearInterval(clock);

    const toSend = {
        name,
        password
    }

    fetch(GET_TIMETABLE_URL, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(newTimeTable => {

            if (newTimeTable.message === "Error Wrong Timetable") {
                formErrorHandler.querySelector("h2").textContent = "Error With Input";
                return;
            }

            GenerateTimeTable(newTimeTable.lectures);
            CheckTime(newTimeTable.lectures);
        });
}

function CheckTime(timetable) {
    let alreadyOpen = [];
    let calls = 0;

    clearInterval(clock);

    clock = setInterval(function() {

        let d = new Date();
        let day = d.getDay();
        let hour = d.getHours().toString();
        let minute = d.getMinutes().toString();
        let test = "23:45";
        let tset = "Mo";

        for (let i = 0; i < timetable.length; i++) {
            const lecture = timetable[i];
            if (lecture.day.toString() === NumberToDay(day).toString()) {
                if (lecture.time.toString() === hour + ":" + minute) {
                    if (alreadyOpen.includes(lecture)) {} else {
                        //The time has come to open a new tab
                        window.open(lecture.url);
                        alreadyOpen.push(lecture);
                    }
                }
            }
        }

        calls += 1;
        if (calls >= 100) {
            calls = 0;
            alreadyOpen = [];
        }

    }, 1000);
}

function GenerateTimeTable(timetable) {
    const timetableParent = document.querySelector(".TimeTable");
    timetableParent.innerHTML = "";

    const differentDays = GetDifferentDays(timetable);

    for (let i = 0; i < differentDays.length; i++) {
        const mainDiv = CreateDay(differentDays[i]);

        for (let j = 0; j < timetable.length; j++) {
            const lecture = timetable[j];

            if (lecture.day.toString() === differentDays[i].toString()) {
                const lectureDiv = CreateLecture(lecture.url, lecture.time, lecture.name);
                mainDiv.appendChild(lectureDiv);
            }
        }
        timetableParent.appendChild(mainDiv);
    }

    timetableParent.style.setProperty('grid-template-columns', 'repeat(' + differentDays.length + ', 1fr)');
    if (differentDays.length === 7) {
        timetableParent.style.setProperty('width', "100%");
        timetableParent.style.setProperty('margin-left', "0%");
        timetableParent.style.setProperty('margin-right', "0%");
        timetableParent.style.setProperty("grid-gap", "0em");
        //timetableParent.style.setProperty('width', "100%");
    } else {
        timetableParent.style.setProperty('width', "90%");
        timetableParent.style.setProperty('margin-left', "5%");
        timetableParent.style.setProperty('margin-right', "5%");
        timetableParent.style.setProperty("grid-gap", "1em");
    }
    // Update the grid columns to match number of days
}

function NumberToDay(number) {
    days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    return (days[number - 1]);
}

function GetDifferentDays(timetable) {
    toReturn = [];
    for (let i = 0; i < timetable.length; i++) {
        const lecture = timetable[i];
        if (!toReturn.includes(lecture.day.toString())) {
            toReturn.push(lecture.day.toString());
        }
    }

    return toReturn //Return a list with every name once
}

function CreateClassDiv() {
    const form = document.createElement("form");
    const h3Name = document.createElement("h3");
    h3Name.textContent = "Name";
    const h3Link = document.createElement("h3");
    h3Link.textContent = "Link";
    const h3Time = document.createElement("h3");
    h3Time.textContent = "Time";
    const h3Weekday = document.createElement("h3");
    h3Weekday.textContent = "Day";

    const name = document.createElement("input");
    name.type = "text"
    name.name = "LectureName";
    const url = document.createElement("input");
    url.type = "url";
    url.name = "LectureURL";
    const time = document.createElement("input");
    time.type = "time";
    time.name = "LectureTime";
    const day = document.createElement("select");
    day.name = "LectureDay";

    const mo = document.createElement("option");
    mo.value = "Mo";
    mo.textContent = "Monday";
    const tu = document.createElement("option");
    tu.value = "Tu";
    tu.textContent = "Tuesday";
    const we = document.createElement("option");
    we.value = "We";
    we.textContent = "Wednesday";
    const th = document.createElement("option");
    th.value = "Th";
    th.textContent = "Thursday";
    const fr = document.createElement("option");
    fr.value = "Fr";
    fr.textContent = "Friday";
    const sa = document.createElement("option");
    sa.value = "Sa";
    sa.textContent = "Saturday";
    const su = document.createElement("option");
    su.value = "Su";
    su.textContent = "Sunday";

    const deleteB = document.createElement("button");
    deleteB.textContent = "Delete";
    deleteB.onclick = function() {
        form.remove();
    };

    day.appendChild(mo);
    day.appendChild(tu);
    day.appendChild(we);
    day.appendChild(th);
    day.appendChild(fr);
    day.appendChild(sa);
    day.appendChild(su);

    form.appendChild(h3Name);
    form.appendChild(name);
    form.appendChild(h3Link);
    form.appendChild(url);
    form.appendChild(h3Time);
    form.appendChild(time);
    form.appendChild(h3Weekday);
    form.appendChild(day);
    form.appendChild(deleteB);

    form.className = "CreateTimeTableClass"

    //parent.appendChild(form);
    document.querySelector(".createClasses").appendChild(form);
}

function CreateDay(name) {
    const div = document.createElement("div");
    div.className = "TimeTableDay";
    const header = document.createElement("div");
    header.className = "TimeTableHeader";
    const lectures = document.createElement("div");
    lectures.className = "TimeTableLectures";

    const headerH2 = document.createElement("h2");
    headerH2.textContent = GetFullName(name).toString();
    header.appendChild(headerH2);

    div.appendChild(header);
    div.appendChild(lectures);

    return div;
}

function GetFullName(name) {
    if (name.toString() === "Mo") { return "Monday"; }
    if (name.toString() === "Tu") { return "Tuesday"; }
    if (name.toString() === "We") { return "Wednesday"; }
    if (name.toString() === "Th") { return "Thursday"; }
    if (name.toString() === "Fr") { return "Friday"; }
    if (name.toString() === "Sa") { return "Saturday"; }
    if (name.toString() === "Su") { return "Sunday"; }
    return name;
}

function CreateLecture(LINK, TIME, NAME) {
    const div = document.createElement("div");
    const Link = document.createElement("h2");
    const link = document.createElement("h3");
    const Time = document.createElement("h2");
    const time = document.createElement("h3");
    const br = document.createElement("br");

    div.className = "TimeTableLecture";
    Link.className = "TimeTableLinkH2";
    link.className = "TimeTableLinkH3";
    Time.className = "TimeTableTimeH2";
    time.className = "TimeTableTimeH3";

    Link.textContent = "Link:"
    if (NAME != undefined) {
        Link.textContent = NAME.toString();
    } else {}
    link.textContent = LINK.toString();
    Time.textContent = "Time:"
    time.textContent = TIME.toString();

    div.appendChild(Link);
    div.appendChild(link);
    div.appendChild(Time);
    div.appendChild(time);
    div.appendChild(br);

    return div;
}