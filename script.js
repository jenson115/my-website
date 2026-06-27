const canvas = document.querySelector("#posterCanvas");
const ctx = canvas.getContext("2d");
const form = document.querySelector("#vehicleForm");
const detailUpload = document.querySelector("#detailUpload");
const photoUpload = document.querySelector("#photoUpload");
const detailName = document.querySelector("#detailName");
const photoCount = document.querySelector("#photoCount");
const thumbRow = document.querySelector("#thumbRow");
const downloadBtn = document.querySelector("#downloadBtn");
const randomizeBtn = document.querySelector("#randomizeBtn");
const copyPromptBtn = document.querySelector("#copyPromptBtn");
const templateButtons = document.querySelectorAll(".template-button");

let activeTemplate = "premium";
let uploadedImages = [];
let selectedImage = null;
let layoutVariant = 0;

const fields = {
  modelName: document.querySelector("#modelName"),
  price: document.querySelector("#price"),
  year: document.querySelector("#year"),
  mileage: document.querySelector("#mileage"),
  engine: document.querySelector("#engine"),
  location: document.querySelector("#location"),
  highlights: document.querySelector("#highlights"),
};

function getVehicleData() {
  return Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value.trim()]));
}

function fillBackground(style) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (style === "sale") {
    gradient.addColorStop(0, "#f6f0e6");
    gradient.addColorStop(0.56, "#ffffff");
    gradient.addColorStop(1, "#d4dae0");
  } else if (style === "social") {
    gradient.addColorStop(0, "#102d38");
    gradient.addColorStop(0.55, "#194f50");
    gradient.addColorStop(1, "#f2f4f1");
  } else {
    gradient.addColorStop(0, "#111821");
    gradient.addColorStop(0.55, "#283240");
    gradient.addColorStop(1, "#e6e9eb");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawFallbackCar() {
  const baseY = layoutVariant % 2 === 0 ? 610 : 570;
  ctx.save();
  ctx.translate(120, baseY);
  ctx.fillStyle = "#e8edf1";
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(140, 210);
  ctx.bezierCurveTo(230, 70, 470, 20, 705, 124);
  ctx.bezierCurveTo(805, 140, 900, 196, 910, 278);
  ctx.lineTo(80, 278);
  ctx.bezierCurveTo(84, 246, 104, 224, 140, 210);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1f2a35";
  ctx.beginPath();
  ctx.moveTo(300, 115);
  ctx.lineTo(460, 74);
  ctx.lineTo(574, 130);
  ctx.lineTo(266, 154);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#20242c";
  [250, 740].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 286, 74, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8d0d8";
    ctx.beginPath();
    ctx.arc(x, 286, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#20242c";
  });
  ctx.restore();
}

function drawUploadedImage() {
  if (!selectedImage) {
    drawFallbackCar();
    return;
  }

  const imageArea =
    activeTemplate === "social"
      ? { x: 90, y: 230, w: 900, h: 620 }
      : { x: 76, y: 250, w: 928, h: 560 };

  ctx.save();
  roundedRect(imageArea.x, imageArea.y, imageArea.w, imageArea.h, 28);
  ctx.clip();
  const scale = Math.max(imageArea.w / selectedImage.width, imageArea.h / selectedImage.height);
  const w = selectedImage.width * scale;
  const h = selectedImage.height * scale;
  ctx.drawImage(selectedImage, imageArea.x + (imageArea.w - w) / 2, imageArea.y + (imageArea.h - h) / 2, w, h);
  ctx.restore();
}

function drawStat(label, value, x, y, darkText) {
  ctx.fillStyle = darkText ? "#eef1f3" : "rgba(255,255,255,0.12)";
  roundedRect(x, y, 210, 106, 8);
  ctx.fill();
  ctx.fillStyle = darkText ? "#6a7280" : "rgba(255,255,255,0.58)";
  ctx.font = "800 18px Arial";
  ctx.fillText(label, x + 22, y + 34);
  ctx.fillStyle = darkText ? "#111821" : "#ffffff";
  ctx.font = "900 27px Arial";
  ctx.fillText(value || "-", x + 22, y + 76);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = "";
  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function drawTextBlock(data) {
  const darkText = activeTemplate === "sale";
  const mainColor = darkText ? "#111821" : "#ffffff";
  const mutedColor = darkText ? "#5f6875" : "rgba(255,255,255,0.75)";

  ctx.fillStyle = activeTemplate === "sale" ? "#c9292f" : "#c89d54";
  ctx.font = "800 28px Arial";
  ctx.fillText("EXPORT READY VEHICLE", 76, 105);

  ctx.fillStyle = mainColor;
  ctx.font = "900 68px Arial";
  wrapText(data.modelName || "Vehicle Model", 76, 182, 840, 76);

  const statY = activeTemplate === "social" ? 950 : 910;
  drawStat("YEAR", data.year, 76, statY, darkText);
  drawStat("MILEAGE", data.mileage, 316, statY, darkText);
  drawStat("ENGINE", data.engine, 596, statY, darkText);

  ctx.fillStyle = mutedColor;
  ctx.font = "500 30px Arial";
  wrapText(data.highlights || "Premium vehicle, ready for inspection and export.", 76, statY + 150, 900, 42);

  if (activeTemplate === "sale") {
    ctx.fillStyle = "#111821";
    ctx.font = "900 92px Arial";
    ctx.fillText(data.price || "Ask Price", 76, 760);
    ctx.fillStyle = "#c9292f";
    ctx.fillRect(76, 795, 340, 12);
  } else {
    ctx.fillStyle = "#ffffff";
    roundedRect(76, 760, 360, 110, 8);
    ctx.fill();
    ctx.fillStyle = "#111821";
    ctx.font = "900 52px Arial";
    ctx.fillText(data.price || "Ask Price", 106, 832);
  }

  ctx.fillStyle = mainColor;
  ctx.font = "800 28px Arial";
  ctx.fillText(data.location || "Ready Stock", 76, 1268);
  ctx.fillStyle = activeTemplate === "sale" ? "#111821" : "#ffffff";
  ctx.font = "900 32px Arial";
  ctx.fillText("AutoCanvas", 790, 1268);
}

function drawPoster() {
  const data = getVehicleData();
  fillBackground(activeTemplate);

  ctx.fillStyle = activeTemplate === "sale" ? "rgba(255,255,255,0.86)" : "rgba(10,13,18,0.5)";
  roundedRect(46, 46, 988, 1258, 24);
  ctx.fill();

  drawUploadedImage();
  drawTextBlock(data);
}

function loadImageFromFile(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

detailUpload.addEventListener("change", () => {
  const file = detailUpload.files[0];
  detailName.textContent = file ? file.name : "支持图片或 PDF";
});

photoUpload.addEventListener("change", async () => {
  const files = [...photoUpload.files].filter((file) => file.type.startsWith("image/"));
  photoCount.textContent = files.length ? `已选择 ${files.length} 张` : "建议 5-20 张";
  thumbRow.innerHTML = "";
  uploadedImages = await Promise.all(files.map(loadImageFromFile));
  selectedImage = uploadedImages[0] || null;

  files.slice(0, 8).forEach((file, index) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = `车辆图片 ${index + 1}`;
    img.addEventListener("click", () => {
      selectedImage = uploadedImages[index];
      drawPoster();
    });
    thumbRow.appendChild(img);
  });

  drawPoster();
});

templateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    templateButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeTemplate = button.dataset.template;
    drawPoster();
  });
});

Object.values(fields).forEach((input) => input.addEventListener("input", drawPoster));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  drawPoster();
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${fields.modelName.value || "vehicle"}-poster.png`.replace(/\s+/g, "-");
  link.href = canvas.toDataURL("image/png");
  link.click();
});

randomizeBtn.addEventListener("click", () => {
  layoutVariant += 1;
  drawPoster();
});

copyPromptBtn.addEventListener("click", async () => {
  const data = getVehicleData();
  const prompt = `Create a premium automotive sales poster for ${data.modelName}. Price: ${data.price}. Year: ${data.year}. Mileage: ${data.mileage}. Engine: ${data.engine}. Location: ${data.location}. Highlights: ${data.highlights}. Use uploaded vehicle photos as the exact car reference, keep the vehicle realistic, clean dealership lighting, luxury export car sales style, no fake logos, no watermark.`;
  await navigator.clipboard.writeText(prompt);
  copyPromptBtn.textContent = "已复制提示词";
  setTimeout(() => {
    copyPromptBtn.textContent = "复制生图提示词";
  }, 1600);
});

drawPoster();
