// selector input form.
let schema = `
        <form class="form1">
            <div class="seleceTv d-flex">
              <select
                name="type"
                class="form-select form-select-sm"
                aria-label=".form-select-sm example"
              >
                <option selected disabled>What you need?</option>
                <option value="txt">TEXT</option>
                <option value="link">LINK</option>
                <option disabled value="img">IMAGE</option>
              </select>

              <div class="input-group mb-3">
                <input
                  type="text"
                  name="name"
                  class="form-control"
                  placeholder="name"
                />
                <input
                  type="text"
                  class="form-control"
                  \
                  name="data"
                  placeholder="Selector  ex: div.product-details > p"
                  style="width: 60%"
                />
              </div>
            </div>
          </form>
      `;
// selector inputs div
let selectors = document.querySelector("#selectors");

// forms
let form = document.querySelector("#form0");
let exportForm = document.querySelector("#exporter");

// add more input btn
let add = document.querySelector("#addMore");
let startBtn = document.querySelector(".start-scrapy");
let downBtn = document.querySelector(".download-btn");

// option select
let pageSel = document.querySelector(".page-selector");
let exportSel = document.querySelector(".export-selector");

// store data for global use
let global = {
  url: null,
  results: null,
  selector: [],
};

// function for save data to xls
const exportExcel = (data, workSheetColumnNames, workSheetName, filePath) => {
  const workBook = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnNames, ...data];
  const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName);
  XLSX.writeFile(workBook, filePath);
};

// click event on add btn
let i = 0;
add.onclick = () => {
  i++;
  if (i >= 4) {
    // show message on max count
    add.previousElementSibling.innerHTML = "cant add more";
    setTimeout(() => (add.previousElementSibling.innerHTML = ""), 2000); // clear error message after 3s
    add.classList.add("d-none");
  } else {
    selectors.insertAdjacentHTML("beforeend", schema); // insert form schema in selectors div
  }
};

// form event - for process and send data to server
form.onsubmit = async (event) => {
  try {
    event.preventDefault();

    let selecForm = document.querySelectorAll(".form1"); // select all selectors_input forms

    let form0 = Object.fromEntries(new FormData(form).entries()); // get url and page inputs data
    global.url = form0.url; // set url in global

    if (form0.type === "single") {
      form0 = { url: form0.url };
    }

    // here will be pushed all selector obj
    selecForm.forEach((e) => {
      let ar = Object.fromEntries(new FormData(e).entries()); // create object for selector form data
      if (ar.data !== "" && ar.name !== "") global.selector.push(ar); // push to data[]
    });

    let response;
    if (form0.url && global.selector) {
      // changing the start button
      startBtn.classList.remove("btn-primary");
      startBtn.classList.add("btn-secondary");
      startBtn.setAttribute("disabled", "");
      startBtn.innerHTML = "Processing...";

      // api request
      response = await fetch("http://localhost:5000/api/v1/get-data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form0,
          selector: global.selector,
        }), // the final object
      });
    }
    // send data to server
    global.results = await response.json();

    // changing the start btn on result, also show the export option on success
    if (global.results) {
      this.reset();
      startBtn.classList.remove("btn-primary");
      startBtn.classList.add("btn-success");
      startBtn.innerHTML = "Scraping Complete";
      document.querySelector(".exporter-option").classList.remove("d-none");
    } else {
      startBtn.classList.add("btn-danger");
      startBtn.classList.remove("btn-primary");
      startBtn.innerHTML = "Scraping Failed";
    }
  } catch (error) {
    console.log(error);
  }
};

// selector for multipage or single
pageSel.addEventListener("click", (e) => {
  let select = Object.fromEntries(new FormData(form).entries());
  let pageInput = document.querySelector(".page-input");

  if (select.type === "multi") {
    pageInput.classList.remove("d-none");
  } else {
    pageInput.classList.add("d-none");
  }
});

// export method selector
exportSel.addEventListener("click", (e) => {
  let select = Object.fromEntries(new FormData(exportForm).entries());
  let btn = document.querySelector(".export-button");

  if (select.type === "xlsx") {
    btn.classList.remove("d-none");
    btn.innerHTML = "Download";
  } else if (select.type === "gSheet") {
    btn.classList.remove("d-none");
    btn.innerHTML = "GO";
  }
});

// the exporter
exportForm.onsubmit = async (event) => {
  try {
    event.preventDefault(); // stop from reload
    let header = [...global.selector.map((e) => e.name)];
    const fileName = `${global.url.replace(/.+\/\/|www.|\..+/g, "")}.xls`;
    const workSheetName = global.url.replace(/.+\/\/|www.|\/.+/g, "");

    let type = Object.fromEntries(new FormData(this).entries());
    if (type.type === "xlsx") {
      exportExcel(global.results, header, workSheetName, fileName);
      setTimeout(() => {
        location.reload();
      }, 1000); // on success take a reload for new start
    }
  } catch (e) {
    console.log(e);
  }
};
