// Проверяет должны ли кнопки удаления быть отключенными
function checkDisabled() {
	if ($("#editable-table tr").length > 2 && selected_cell != null) {
		// Удаление строк разрешено
		$("#delete-row").prop("disabled", false);
	} else {
		// Удаление строк запрещено
		$("#delete-row").prop("disabled", true);
	}

	if ($("#editable-table tr:first-child td").length > 2 && selected_cell != null) {
		// Удаление столбцов разрешено
		$("#delete-column").prop("disabled", false);
	} else {
		// Удаление столбцов запрещено
		$("#delete-column").prop("disabled", true);
	}
}

// Возвращает массив координат для яйчейки
function getCellCoordinates(cell) {
	let x = cell.index();
	let y = cell.parent().index();
	return {x, y};
}

// Передаёт фокус полю ввода на основании данных выбранной яйчейки
function focusInput(cell) {
	$("#edit-cell-content").val(cell.text()).focus();
	cell.css("box-shadow", "0px 0px 4px 4px #9E9E9E inset");
}

// Добавляет функционал яйчейкам таблицы
function reloadCells() {
	// Позволяем яйчейкам таблицы изменять ширину
	$("td").resizable({
		handles: "e",
		resize: function() {
			updateMarkup(true, false);
		}
	});

	// Когда нажимаем на яйчейку, 'выбираем' её
	$("td").click(function(e) {
		if (selected_cell != null) {
			selected_cell.css("box-shadow", "none");
			moveValueToCell(selected_cell);
		}

		selected_cell = $(this);
		let {x, y} = getCellCoordinates(selected_cell);
		selected_x = x;
		selected_y = y;

		focusInput(selected_cell);
		checkDisabled();
		e.stopPropagation();
	});
}

// Вызывается когда таблица изменяется (количество строк или столбцов меняется)
function onTableUpdate(changedRows) {
	checkDisabled(); // Проверяем должны ли кнопки удаления быть отключены
	reloadCells(); // Перезагружает функционал яйчеек

	// Если changedRows = true, то добавили/удалили строки, обновлять надо тело разметки
	// Иначе добавили/удалили колонки, обновляет как тело так и голову
	updateMarkup(!changedRows, true);
}

// Обновляет разметку
function updateMarkup(update_head, update_body) {
	// updateHead - нужно ли обновлять голову разметки
	// updateBody - нужно ли обновлять тело разметки
	if (update_head) markup_head = getMarkupHead();
	if (update_body) markup_body = getMarkupBody();
	$("#markup").html(markup_head + markup_body);
}

// Передаёт значение из поля ввода в яйчейку, а так же обновляет разметку
function moveValueToCell(cell) {
	if (cell == null) return;
	let text = $("#edit-cell-content").val();
	if (cell.contents().length == 1) {
		// У этой яйчейки не было текста, добавляем
		cell.append(text);
	} else {
		// У этой яйчейки был текст, заменяем
		cell.contents().filter(function() {return this.nodeType==3;}).first().replaceWith(text);
	}
	updateMarkup(false, true);
}

// Копирует разметку
function copyMarkup() {
	navigator.clipboard.writeText($("#markup").text()).then(alert("Успешно скопировано"));
}

// Добавляет столбец слева или справа от определённой колонки
function addColumn(index, direction) {
	// Если direction = -1, добавляем слева, если 1, справа
	$("#editable-table").find("tr").each(function() {
		if (direction == -1) {
			$(this).find("td").eq(index).before("<td></td>");
		} else if (direction == 1) {
			$(this).find("td").eq(index).after("<td></td>");
		}
    });
    if (direction == -1) {
		// Т.к. мы добавляем слева, нужно увеличить индекс выделенной яйчейки
		selected_x++;
	}
    table_width++;
    reloadCells();
    checkDisabled();
    updateMarkup(true, true);
}

// Удаляет столбец
function removeColumn(x) {
	$("#editable-table").find("tr").each(function() {
		$(this).find("td").eq(x).remove();
	});
	table_width--;
	checkDisabled();
	$("#edit-cell-content").val("");
	updateMarkup(true, true);
}

// Добавляет строку слева или справа от определённой строки
function addRow(index, direction) {
	// Если direction = -1, добавляем вверх, если 1, вниз
	if (direction == -1) {
		$("#editable-table").find("tr").eq(index).before("<tr>" + "<td></td>".repeat(table_width) + "</tr>");
	} else if (direction == 1) {
		$("#editable-table").find("tr").eq(index).after("<tr>" + "<td></td>".repeat(table_width) + "</tr>");
	}
	if (direction == -1) {
		// Т.к. мы добавляем сверху, нужно увеличить индекс выделенной яйчейки
		selected_y++;
	}
    table_height++;
    checkDisabled();
    reloadCells();
    updateMarkup(false, true);
}

// Удаляет строку
function removeRow(y) {
	selected_cell = null;
	selected_x = null;
	selected_y = null;
	$("#editable-table").find("tr").eq(y).remove();
	table_height--;
	checkDisabled();
	$("#edit-cell-content").val("");
	updateMarkup(false, true);
}

// Устанавливает стиль выравнивания текста колонке таблицы
function setColumnAlignment(x, align_mode) {
	$("#editable-table").find("tr").each(function() {
		$(this).find("td").eq(x).css("text-align", align_mode);
	});
	updateMarkup(true, false);
}

// Устанавливает цвет фона колонке таблицы
function paintColumn(x, color) {
	$("#editable-table").find("tr").each(function() {
		$(this).find("td").eq(x).css("background-color", color);
	});
}

// Устанавливает цвет фона строке таблицы
function paintRow(y, color) {
	$("#editable-table").find("tr").eq(y).find("td").css("background-color", color);
}

// Данные выбранной яйчейки
let selected_x = null;
let selected_y = null;
let selected_cell = null;

// Данные таблицы
let table_width = 2;
let table_height = 2;

let markup_head = null; // Голова разметки
let markup_body = null; // Тело разметки

// DOM элементы
let table = document.getElementById("editable-table");

$(function() {
	checkDisabled();
	reloadCells();
	$("#table-title").val("Таблица");
	updateMarkup(true, true);

	// Установка названия таблицы
	$("#set-table-name").click(function() {
		updateMarkup(true, false);
	});

	// Установка значения в яйчейке
	$("#edit-apply").click(function() {
		moveValueToCell(selected_cell);
	});

	// Если мы кликаем в другое место документа, сохраняем содержимое яйчейки
	$(".page-container").click(function() {
		moveValueToCell(selected_cell);
		if (selected_cell != null) {
			selected_cell.css("box-shadow", "none");
		}
		selected_cell = null;
		selected_x = null;
		selected_y = null;
		checkDisabled();
	});

	// Если нажимаем enter, сохраняем содержимое яйчейки, переносим выделение ниже
	$(document).keypress(function(e) {
		if (selected_cell == null) return;

		if (e.keyCode == 13 && !e.ctrlKey) { // Enter
			selected_y++;

			if (table_height == selected_y) {
				// Добавляем строку снизу т.к. не хватает места
				addRow(selected_y - 1, 1);
			}

		} else if (e.keyCode == 13 && e.ctrlKey) { // Ctrl+Enter
			selected_x++;

			if (table_width == selected_x) {
				// Добавляем столбец справа т.к. не хватает места
				addColumn(selected_x - 1, 1);
			}

		} else {
			return;
		}

		moveValueToCell(selected_cell);
		selected_cell.css("box-shadow", "none");
		selected_cell = $("#editable-table").find("tr").eq(selected_y).find("td").eq(selected_x);
		focusInput(selected_cell);
	});

	// Выравнивание по левому краю
	$("#align-left").click(function() {
		setColumnAlignment(selected_x, "left");
	});

	// Выравнивание по центру
	$("#align-center").click(function() {
		setColumnAlignment(selected_x, "center");
	});

	// Выравнивание по правому краю
	$("#align-right").click(function() {
		setColumnAlignment(selected_x, "right");
	});

	// Удаление колонки
	$("#delete-column").click(function() {
		if (confirm("Точно удалить выделенную колонку?") == false) return;
		removeColumn(selected_x);
	});

	// Удаление строки
	$("#delete-row").click(function() {
		if (confirm("Точно удалить выделенную строку?") == false) return;
		removeRow(selected_y);
	});

	// Добавление строки сверху
	$("#insert-row-top").click(function() {
		if (selected_cell == null) return;
		addRow(selected_y, -1);
	});

	// Добавление строки снизу
	$("#insert-row-bottom").click(function() {
		if (selected_cell == null) return;
		addRow(selected_y, 1);
	});

	// Добавление столбца справа (Спасибо, https://stackoverflow.com/a/20239146)
	$("#insert-col-right").click(function() {
		if (selected_cell == null) return;
		addColumn(selected_x, 1);
	});

	// Добавление столбца слева
	$("#insert-col-left").click(function() {
		if (selected_cell == null) return;
		addColumn(selected_x, -1);
	});

	// Подсвечиваем колонку, к которой будет применён эффект
	$(".align-control").mouseenter(function () {
		if (selected_cell == null) return;
		paintColumn(selected_x, "#C1B2FF");
	});
	$(".align-control").mouseleave(function () {
		if (selected_cell == null) return;
		paintColumn(selected_x, "");
	});

	$("#delete-column").mouseenter(function () {
		if (selected_cell == null) return;
		paintColumn(selected_x, "#FFABA5");
	});
	$("#delete-column").mouseleave(function () {
		if (selected_cell == null) return;
		paintColumn(selected_x, "");
	});

	$("#delete-row").mouseenter(function () {
		if (selected_cell == null) return;
		paintRow(selected_y, "#FFABA5")
	});

	$("#delete-row").mouseleave(function () {
		if (selected_cell == null) return;
		paintRow(selected_y, "");
	});
});

// Считывает значения ширин столбцов таблицы и генерирует первую строку таблицы
function getMarkupHead() {
	let output = "@" + $("#table-title").val();

	let col_count = table.rows[0].cells.length;

	let table_row = $(table.rows[1].cells);
	for (let x = 0; x < col_count; x++) {
		let column = $(table_row[x]);
		let width = Math.round(column.width());
		let align = column.css("text-align");
		output += ":" + width + "_" + align;
	}

	return output + "\n";
}

// Парсит табличные значения, переводит их в разметку для отчёта
function getMarkupBody() {
	// Подсчитываем количество столбцов и строк
	let col_count = table.rows[0].cells.length;
	let row_count = table.rows.length;

	// Ищем самое максимальное количество символов в столбцах
	let max_symbol_counts = new Array(col_count);
	for (let x = 0; x < col_count; x++) max_symbol_counts[x] = 0;

	for (let y = 0; y < row_count; y++) {
		let table_row = table.rows[y].cells;
		for (let x = 0; x < col_count; x++) {
			if (table_row[x].textContent.length > max_symbol_counts[x]) {
				max_symbol_counts[x] = table_row[x].textContent.length;
			}
		}
	}

	// Составляем текст
	let output = "";
	for (let y = 0; y < row_count; y++) {
		let table_row = table.rows[y].cells;
		for (let x = 0; x < col_count; x++) {
			let cell_content = table_row[x].textContent;
			output += "| " + cell_content + " ".repeat(max_symbol_counts[x] - cell_content.length) + " ";
		}
		output += "|\n";
	}
	return output;
}
