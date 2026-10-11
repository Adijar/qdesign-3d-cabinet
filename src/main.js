import * as THREE from "three"; // Импортируем библиотеку Three.js для создания 3D-сцены.
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // Подключаем управление камерой мышью и касанием.
import "./style.css"; // Подключаем стили интерфейса.

const viewer = document.querySelector("#viewer"); // Находим область, в которой будет показана 3D-модель.
const loading = document.querySelector("#loading"); // Находим надпись о загрузке модели.
const widthInput = document.querySelector("#width"); // Получаем поле ширины.
const heightInput = document.querySelector("#height"); // Получаем поле высоты.
const depthInput = document.querySelector("#depth"); // Получаем поле глубины.
const summary = document.querySelector("#dimension-summary"); // Получаем плашку с текущими размерами.
const materialName = document.querySelector("#material-name"); // Получаем текст с названием материала.
const materialButtons = [...document.querySelectorAll("[data-material]")]; // Собираем все кнопки выбора цвета в массив.
const resetButton = document.querySelector("#reset-view"); // Получаем кнопку сброса ракурса.

const scene = new THREE.Scene(); // Создаём 3D-сцену, в которой находятся все объекты.
scene.background = new THREE.Color("#eef1f5"); // Задаём светлый фон сцены.
scene.fog = new THREE.Fog("#eef1f5", 5, 12); // Добавляем лёгкую дымку вдали для глубины.

const camera = new THREE.PerspectiveCamera( // Создаём перспективную камеру.
  38, // Угол обзора камеры в градусах.
  1, // Начальное соотношение ширины к высоте; ниже обновим его по размеру окна.
  0.01, // Минимальная дистанция, на которой камера видит объекты.
  100 // Максимальная дистанция, на которой камера видит объекты.
);
camera.position.set(1.55, 1.35, 2.15); // Ставим камеру перед тумбой и немного выше неё.

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); // Создаём WebGL-рендерер с сглаживанием краёв.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ограничиваем плотность пикселей для производительности.
renderer.shadowMap.enabled = true; // Включаем расчёт теней.
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Выбираем мягкие края теней.
renderer.outputColorSpace = THREE.SRGBColorSpace; // Настраиваем корректное отображение цветов.
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Используем тональное отображение для более естественного света.
renderer.toneMappingExposure = 1.15; // Немного повышаем экспозицию сцены.
viewer.appendChild(renderer.domElement); // Добавляем готовый canvas в область просмотра.

const controls = new OrbitControls(camera, renderer.domElement); // Связываем вращение камеры с canvas.
controls.enableDamping = true; // Включаем плавное затухание движения после перетаскивания.
controls.dampingFactor = 0.06; // Настраиваем силу плавного затухания.
controls.enablePan = false; // Запрещаем сдвиг камеры в сторону, чтобы модель не терялась.
controls.minDistance = 0.9; // Ограничиваем приближение камеры.
controls.maxDistance = 5.5; // Ограничиваем отдаление камеры.
controls.maxPolarAngle = Math.PI * 0.49; // Не даём камере уйти под пол.
controls.target.set(0, 0.4, 0); // Направляем камеру на центр будущей тумбы.

const ambientLight = new THREE.HemisphereLight("#ffffff", "#b6a998", 2.1); // Добавляем мягкий свет сверху и отражённый свет снизу.
scene.add(ambientLight); // Добавляем общий свет на сцену.

const keyLight = new THREE.DirectionalLight("#fff4e5", 3.2); // Создаём основной направленный свет тёплого оттенка.
keyLight.position.set(-3, 5, 4); // Располагаем источник света сверху спереди слева.
keyLight.castShadow = true; // Разрешаем основному свету отбрасывать тени.
keyLight.shadow.mapSize.set(2048, 2048); // Повышаем разрешение карты теней.
keyLight.shadow.camera.left = -3; // Устанавливаем левую границу области теней.
keyLight.shadow.camera.right = 3; // Устанавливаем правую границу области теней.
keyLight.shadow.camera.top = 3; // Устанавливаем верхнюю границу области теней.
keyLight.shadow.camera.bottom = -1; // Устанавливаем нижнюю границу области теней.
keyLight.shadow.bias = -0.0004; // Уменьшаем вероятность визуальных артефактов на тенях.
scene.add(keyLight); // Добавляем основной источник света.

const fillLight = new THREE.DirectionalLight("#dbe8ff", 1.15); // Создаём холодный заполняющий свет для теневой стороны.
fillLight.position.set(4, 2.5, -3); // Ставим заполняющий свет справа и сзади.
scene.add(fillLight); // Добавляем заполняющий свет.

const floorMaterial = new THREE.MeshStandardMaterial({ color: "#e4e7ec", roughness: 0.92 }); // Создаём матовый материал пола.
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), floorMaterial); // Создаём большую плоскость пола.
floor.rotation.x = -Math.PI / 2; // Поворачиваем плоскость горизонтально.
floor.position.y = -0.012; // Опускаем пол немного ниже основания тумбы.
floor.receiveShadow = true; // Разрешаем полу принимать тени.
scene.add(floor); // Добавляем пол на сцену.

const grid = new THREE.GridHelper(4, 40, "#cbd1da", "#d9dee5"); // Создаём тонкую сетку для ощущения масштаба.
grid.position.y = -0.008; // Размещаем сетку почти на уровне пола.
grid.material.transparent = true; // Делаем материал сетки прозрачным.
grid.material.opacity = 0.32; // Уменьшаем заметность линий сетки.
scene.add(grid); // Добавляем сетку в сцену.

const cabinet = new THREE.Group(); // Создаём группу, в которую будем складывать детали тумбы.
scene.add(cabinet); // Добавляем группу на сцену.

const panelThickness = 0.018; // Задаём толщину панелей 18 мм в метрах.
const materials = { // Создаём набор материалов для трёх вариантов цвета.
  white: { label: "Белый", color: "#f3f1eb", roughness: 0.48 }, // Материал белого корпуса.
  gray: { label: "Серый", color: "#858b93", roughness: 0.52 }, // Материал серого корпуса.
  walnut: { label: "Орех", color: "#815638", roughness: 0.43 } // Материал корпуса под орех.
};
let selectedMaterial = "walnut"; // Запоминаем выбранный материал; изначально выбран орех.
let cabinetParts = []; // Здесь храним созданные детали, чтобы правильно удалять их при изменении размеров.

const woodGrainTexture = createWoodTexture(); // Создаём процедурную текстуру с ненавязчивой древесной фактурой.

function createWoodTexture() { // Объявляем функцию создания текстуры дерева без внешних файлов.
  const canvas = document.createElement("canvas"); // Создаём скрытый canvas для рисования текстуры.
  canvas.width = 256; // Задаём ширину текстуры в пикселях.
  canvas.height = 256; // Задаём высоту текстуры в пикселях.
  const context = canvas.getContext("2d"); // Получаем 2D-контекст для рисования.
  context.fillStyle = "#9b704d"; // Выбираем базовый коричневый цвет.
  context.fillRect(0, 0, canvas.width, canvas.height); // Заливаем фон текстуры базовым цветом.
  for (let i = 0; i < 95; i += 1) { // Рисуем множество тонких линий, имитирующих волокна дерева.
    const y = Math.random() * canvas.height; // Случайно выбираем вертикальную координату линии.
    context.beginPath(); // Начинаем новый путь рисования.
    context.moveTo(0, y); // Начинаем линию у левого края.
    context.bezierCurveTo(70, y - 5, 170, y + 5, canvas.width, y + (Math.random() - 0.5) * 12); // Рисуем слегка волнистую линию.
    context.strokeStyle = i % 3 === 0 ? "rgba(55, 31, 17, 0.22)" : "rgba(230, 190, 145, 0.12)"; // Чередуем тёмные и светлые волокна.
    context.lineWidth = Math.random() * 1.4 + 0.25; // Выбираем толщину линии.
    context.stroke(); // Отрисовываем волокно.
  } // Завершаем цикл рисования волокон.
  const texture = new THREE.CanvasTexture(canvas); // Превращаем canvas в текстуру Three.js.
  texture.colorSpace = THREE.SRGBColorSpace; // Указываем цветовое пространство текстуры.
  texture.wrapS = THREE.RepeatWrapping; // Разрешаем повтор текстуры по горизонтали.
  texture.wrapT = THREE.RepeatWrapping; // Разрешаем повтор текстуры по вертикали.
  return texture; // Возвращаем готовую текстуру.
} // Завершаем функцию создания текстуры.

function makeMaterial() { // Создаём материал корпуса с учётом выбранного цвета.
  const settings = materials[selectedMaterial]; // Берём настройки выбранного варианта.
  return new THREE.MeshStandardMaterial({ // Возвращаем физически корректный материал.
    color: settings.color, // Задаём основной цвет материала.
    map: selectedMaterial === "walnut" ? woodGrainTexture : null, // Для ореха используем текстуру дерева.
    roughness: settings.roughness, // Задаём шероховатость поверхности.
    metalness: 0.02 // Оставляем поверхность почти неметаллической.
  }); // Завершаем создание материала.
} // Завершаем функцию создания материала.

function addBox(name, width, height, depth, x, y, z, material, castShadow = true) { // Создаём прямоугольную деталь и размещаем её в группе.
  const geometry = new THREE.BoxGeometry(width, height, depth); // Создаём геометрию коробки нужного размера.
  const mesh = new THREE.Mesh(geometry, material); // Объединяем геометрию с материалом.
  mesh.name = name; // Даём детали имя для удобства отладки.
  mesh.position.set(x, y, z); // Устанавливаем положение детали по трём осям.
  mesh.castShadow = castShadow; // Включаем или отключаем отбрасывание тени.
  mesh.receiveShadow = true; // Разрешаем детали принимать тени от других объектов.
  cabinet.add(mesh); // Добавляем деталь в группу тумбы.
  cabinetParts.push(mesh); // Запоминаем деталь для последующего удаления.
  return mesh; // Возвращаем созданную деталь.
} // Завершаем функцию создания детали.

function rebuildCabinet() { // Полностью пересоздаём тумбу при изменении размеров или цвета.
  const width = Number(widthInput.value) / 1000; // Переводим введённую ширину из миллиметров в метры.
  const height = Number(heightInput.value) / 1000; // Переводим высоту из миллиметров в метры.
  const depth = Number(depthInput.value) / 1000; // Переводим глубину из миллиметров в метры.
  const t = panelThickness; // Сокращённо сохраняем толщину панели.
  const bodyMaterial = makeMaterial(); // Создаём материал для корпуса и дверцы.
  const insideMaterial = new THREE.MeshStandardMaterial({ color: "#d5c7b6", roughness: 0.8 }); // Создаём нейтральный материал для внутренней части.

  for (const part of cabinetParts) { // Проходим по деталям предыдущей модели.
    cabinet.remove(part); // Удаляем каждую старую деталь из сцены через группу.
    part.geometry.dispose(); // Освобождаем память, занятую геометрией детали.
    if (Array.isArray(part.material)) { // Проверяем, использует ли деталь массив материалов.
      part.material.forEach((material) => material.dispose()); // Освобождаем каждый материал из массива.
    } else if (part.material !== bodyMaterial) { // Проверяем, не является ли материал новым материалом текущей модели.
      part.material.dispose(); // Освобождаем старый материал детали.
    } // Завершаем проверку материалов.
  } // Завершаем удаление старых деталей.
  cabinetParts = []; // Очищаем список деталей перед построением новой модели.

  addBox("Левая боковина", t, height, depth, -width / 2 + t / 2, height / 2, 0, bodyMaterial); // Создаём левую боковую стенку.
  addBox("Правая боковина", t, height, depth, width / 2 - t / 2, height / 2, 0, bodyMaterial); // Создаём правую боковую стенку.
  addBox("Верхняя панель", width - 2 * t, t, depth, 0, height - t / 2, 0, bodyMaterial); // Создаём верхнюю панель между боковинами.
  addBox("Нижняя панель", width - 2 * t, t, depth, 0, t / 2, 0, bodyMaterial); // Создаём нижнюю панель между боковинами.
  addBox("Задняя стенка", width - 2 * t, height - 2 * t, 0.006, 0, height / 2, -depth / 2 + 0.003, insideMaterial, false); // Устанавливаем тонкую заднюю стенку.
  addBox("Внутренняя полка", width - 2 * t, 0.014, depth - 0.035, 0, height * 0.48, -0.008, insideMaterial); // Добавляем одну внутреннюю полку.

  const doorWidth = width - 2 * t - 0.004; // Рассчитываем ширину дверцы с небольшими зазорами.
  const doorHeight = height - 2 * t - 0.004; // Рассчитываем высоту дверцы с небольшими зазорами.
  addBox("Дверца", doorWidth, doorHeight, 0.018, 0, height / 2, depth / 2 + 0.009, bodyMaterial); // Ставим одну дверцу перед корпусом.

  const handleMaterial = new THREE.MeshStandardMaterial({ color: "#c3c6ca", metalness: 0.82, roughness: 0.25 }); // Создаём металлический материал ручки.
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.085, 20), handleMaterial); // Создаём цилиндрическую ручку.
  handle.rotation.x = Math.PI / 2; // Поворачиваем ручку так, чтобы она выступала вперёд.
  handle.position.set(width * 0.32, height * 0.52, depth / 2 + 0.027); // Размещаем ручку ближе к правому краю дверцы.
  handle.castShadow = true; // Включаем тень от ручки.
  cabinet.add(handle); // Добавляем ручку в группу тумбы.
  cabinetParts.push(handle); // Запоминаем ручку для удаления при перестроении.
  handle.userData.ownsMaterial = handleMaterial; // Помечаем материал как принадлежащий ручке для корректного освобождения памяти.

  summary.textContent = `${widthInput.value} × ${heightInput.value} × ${depthInput.value} мм`; // Обновляем подпись с текущими размерами.
  materialName.textContent = materials[selectedMaterial].label; // Обновляем название выбранного материала.
} // Завершаем функцию перестроения тумбы.

function resizeRenderer() { // Подгоняем canvas и камеру под текущий размер контейнера.
  const width = viewer.clientWidth; // Получаем фактическую ширину области просмотра.
  const height = viewer.clientHeight; // Получаем фактическую высоту области просмотра.
  if (width === 0 || height === 0) return; // Прерываем функцию, если контейнер пока невидим или имеет нулевой размер.
  camera.aspect = width / height; // Обновляем пропорции камеры.
  camera.updateProjectionMatrix(); // Применяем изменения проекции камеры.
  renderer.setSize(width, height, false); // Меняем размер canvas без изменения CSS-размеров элемента.
} // Завершаем функцию изменения размера.

function animate() { // Объявляем функцию одного кадра анимации.
  requestAnimationFrame(animate); // Просим браузер вызвать эту функцию перед следующим кадром.
  controls.update(); // Обновляем OrbitControls, в том числе плавное движение камеры.
  renderer.render(scene, camera); // Рисуем сцену с текущей камерой.
} // Завершаем функцию анимации.

[widthInput, heightInput, depthInput].forEach((input) => { // Подключаем обработчик к каждому полю размеров.
  input.addEventListener("input", () => { // Реагируем сразу при вводе нового значения.
    const minimum = Number(input.min); // Читаем минимально допустимое значение поля.
    const maximum = Number(input.max); // Читаем максимально допустимое значение поля.
    const value = Number(input.value); // Преобразуем введённый текст в число.
    if (!Number.isFinite(value) || value < minimum || value > maximum) return; // Не строим модель для пустого или недопустимого значения.
    rebuildCabinet(); // Пересоздаём модель с обновлёнными размерами.
  }); // Завершаем обработчик ввода.
}); // Завершаем подключение обработчиков ко всем полям.

materialButtons.forEach((button) => { // Подключаем обработчик к каждой кнопке материала.
  button.addEventListener("click", () => { // Реагируем на нажатие кнопки.
    selectedMaterial = button.dataset.material; // Запоминаем выбранный материал из data-атрибута.
    materialButtons.forEach((item) => { // Обновляем состояние всех кнопок.
      const isActive = item === button; // Проверяем, является ли кнопка выбранной.
      item.classList.toggle("active", isActive); // Добавляем активный стиль только выбранной кнопке.
      item.setAttribute("aria-pressed", String(isActive)); // Обновляем доступное для скринридеров состояние.
    }); // Завершаем обновление кнопок.
    rebuildCabinet(); // Перестраиваем тумбу с новым материалом.
  }); // Завершаем обработчик клика.
}); // Завершаем подключение обработчиков кнопок.

resetButton.addEventListener("click", () => { // Подключаем действие к кнопке сброса ракурса.
  camera.position.set(1.55, 1.35, 2.15); // Возвращаем камеру в исходное положение.
  controls.target.set(0, Number(heightInput.value) / 2000, 0); // Нацеливаем камеру на середину тумбы с учётом её высоты.
  controls.update(); // Немедленно применяем новое положение камеры.
}); // Завершаем обработчик сброса ракурса.

const resizeObserver = new ResizeObserver(resizeRenderer); // Создаём наблюдатель за изменением размера области просмотра.
resizeObserver.observe(viewer); // Запускаем наблюдение за контейнером 3D-модели.
window.addEventListener("resize", resizeRenderer); // Дополнительно реагируем на изменение размера окна браузера.

rebuildCabinet(); // Строим первую тумбу с параметрами по умолчанию.
resizeRenderer(); // Выставляем правильный размер canvas при запуске.
loading.classList.add("hidden"); // Скрываем надпись загрузки после создания сцены.
animate(); // Запускаем непрерывный цикл отображения 3D-сцены.
