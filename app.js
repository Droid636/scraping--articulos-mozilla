import puppeteer from "puppeteer";
import fs from "fs";
import { Parser } from "json2csv";
import XLSX from "xlsx";

async function obtenerDatosMozillaBlog() {
  //1.- Instanciar navegador
  const navegador = await puppeteer.launch({
    headless: false,
    slowMo: 1000,
  });

  //2.- Abrir una nueva pestaña en navegador
  const pagina = await navegador.newPage();

  //3.- Ir a la página web
  await pagina.goto("https://hacks.mozilla.org/");

  const datos = await pagina.evaluate(() => {
    const resultados = [];
    document
      .querySelectorAll("li.list-item.row.listing")
      .forEach((elemento) => {
        const imagen = elemento.querySelector("img.avatar")?.src || "Sin imagen";
        const titulo = elemento.querySelector("h2 > a")?.innerText || "Sin título";
        const parrafo = elemento.querySelector("p")?.innerText || "Sin párrafo";
        const fechaPublicacion = elemento.querySelector("time")?.innerText || "Sin fecha";

        resultados.push({
          pagina: {
            imagen,
            titulo,
            parrafo,
            fechaPublicacion,
          },
        });
      });
    return resultados;
  });
  // Crear archivo JSON
  let jsonData = JSON.stringify(datos);
  fs.writeFileSync(".json", jsonData, "utf-8");
  console.log("Archivo JSON creado!!!");

  //Crear archivo CSV
  const fields = ["imagen", "titulo", "parrafo", "fechaPublicacion"];
  const json2csvParse = new Parser({
    fields,
    defaultValue: "No hay Información",
  });
  const csv = json2csvParse.parse(datos.map(item => item.pagina));
  fs.writeFileSync("datosMozillaBlog.csv", csv, "utf-8");
  console.log("Archivo CSV creado!!!");

  //Crear archivo XLSX
  const data = datos.map(item => {
    return {
      Titulo: item.pagina.titulo,
      Imagen: item.pagina.imagen,
      Parrafo: item.pagina.parrafo,
      FechaPublicacion: item.pagina.FechaPublicacion
    };
  })

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos mozilla Blog");
  XLSX.writeFile(workbook, "datosMozillaBlog.xlsx");

  console.log("Archivo XLSX creado!!!");


  navegador.close();
}

obtenerDatosMozillaBlog();
