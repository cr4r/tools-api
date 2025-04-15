/*
Convert Kata jadi Aaa bbb ccc*/
const sentenceCase = (teks) => {
  return teks.charAt(0).toUpperCase() + teks.substring(1).toLowerCase();
};
/*
Convert Kata jadi Aaaa Bbbb Cccc */
const capitalizeCase = (teks) => {
  let hasil = "";
  let allTeks = teks.split(" ");
  for (i = 0; i < allTeks.length; i++) {
    hasil += sentenceCase(allTeks[i]) + " ";
  }
  return hasil;
};

function pecahString(str, delimiters = ["/", ","]) {
  // Buat regex dari delimiter
  let regex = new RegExp(delimiters.join("|"), "g");

  return str
    .split(regex)
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

module.exports = {
  sentenceCase,
  capitalizeCase,
  pecahString,
};
