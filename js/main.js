// DOM элементы
let table = document.getElementById("editable-table");
let markup_pre = document.getElementById("markup"); // Место, где отображается разметка
let input_title = document.getElementById("table-title"); // Кнопка 'Применить' название таблицы
let selected_column = $("td:nth-child(0)"); // Колонка таблицы, по которой кликнули
let input_cell_content = $("#edit-cell-content"); // Поле ввода содержимого яйчейки

let selected_cell = null; // Выбранная яйчейка

input_title.value = "Таблица";

let markup_head = getMarkupHead();
let markup_body = getMarkupBody();
markup_pre.innerHTML = markup_head + markup_body;

$(function() {
	reloadCells();

	// Когда нажимаем на кнопку 'Применить', обновляем разметку
	$("#set-table-name").click(function() {
		markup_head = getMarkupHead();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	$("#edit-apply").click(function() {
		if (selected_cell == null) return;
		moveValueToCell();
	});

	// Если мы кликаем в другое место документа, сохраняем содержимое яйчейки
	$(document).click(function(){
		if (selected_cell == null) return;
		moveValueToCell();
	});

	// Если нажимаем ctrl+enter, сохраняем содержимое яйчейки
	$(document).keypress(function(event) {
		if (event.keyCode == 13 && selected_cell != null) moveValueToCell();
	});

	// Управление выравниваем текста
	$("#align-left").click(function() {setColumnAlignment("left")});
	$("#align-center").click(function() {setColumnAlignment("center")});
	$("#align-right").click(function() {setColumnAlignment("right")});

	// Удаление колонки
	$("#delete-column").click(function() {
		if (confirm("Точно удалить выделенную колонку?") == false) return;
		selected_cell = null;
		selected_column.remove();
		input_cell_content.val("");
		markup_head = getMarkupHead();
		markup_body = getMarkupBody();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	// Удаление строки
	$("#delete-row").click(function() {
		if (selected_cell == null) {return;}
		if (confirm("Точно удалить выделенную строку?") == false) return;
		selected_cell.parent().remove();
		selected_cell = null;
		input_cell_content.val("");
		markup_head = getMarkupHead();
		markup_body = getMarkupBody();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	// Добавление строки сверху
	$("#insert-row-top").click(function() {
		if (selected_cell == null) return;
		// Находим индекс родителя выбранной яйчейки
		let index = selected_cell.parent().index();
		let col_count = table.rows[0].cells.length;
		// Добавляем
		$("#editable-table").find("tr").eq(index).before("<tr>" + "<td></td>".repeat(col_count) + "</tr>");

        reloadCells();
		markup_body = getMarkupBody();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	// Добавление строки снизу
	$("#insert-row-bottom").click(function() {
		if (selected_cell == null) return;
		// Находим индекс родителя выбранной яйчейки
		let index = selected_cell.parent().index();
		let col_count = table.rows[0].cells.length;
		// Добавляем
		$("#editable-table").find("tr").eq(index).after("<tr>" + "<td></td>".repeat(col_count) + "</tr>");

        reloadCells();
		markup_body = getMarkupBody();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	// Добавление столбца справа
	$("#insert-col-right").click(function() {
		if (selected_cell == null) return;

		// https://stackoverflow.com/questions/20239062/add-column-to-table-with-jquery
		$("#editable-table").find("tr").each(function(){
			$(this).find("td").eq(selected_cell.index()).after("<td></td>");
        });

        reloadCells();
   		markup_head = getMarkupHead();
		markup_body = getMarkupBody();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	// Добавление столбца слева
	$("#insert-col-left").click(function() {
		if (selected_cell == null) return;
		let selected_index = selected_cell.index();

		$("#editable-table").find("tr").each(function() {
			$(this).find("td").eq(selected_index).before("<td></td>");
        });

        reloadCells();
   		markup_head = getMarkupHead();
		markup_body = getMarkupBody();
		markup_pre.innerHTML = markup_head + markup_body;
	});

	// Подсвечиваем колонку, к которой будет применён эффект
	$(".align-control").mouseenter(function () {selected_column.css("background-color", "#C1B2FF");});
	$(".align-control").mouseleave(function () {selected_column.css("background-color", "");});

	$("#delete-column").mouseenter(function () {selected_column.css("background-color", "#FFABA5");});
	$("#delete-column").mouseleave(function () {selected_column.css("background-color", "");});

	$("#delete-row").mouseenter(function () {
		if (selected_cell === null) return;
		selected_cell.parent().css("background-color", "#FFABA5");
	});

	$("#delete-row").mouseleave(function () {
		if (selected_cell === null) return;
		selected_cell.parent().css("background-color", "");
	});
});

// Добавляет функционал яйчейкам таблицы
function reloadCells() {
	// Позволяем яйчейкам таблицы изменять ширину
	$("td").resizable({
		handles: "e",
		resize: function() {
			markup_head = getMarkupHead();
			markup_pre.innerHTML = markup_head + markup_body;
		}
	});

	// Когда нажимаем на яйчейку, 'выбираем' её, так же выбираем и всю колонку
	$("td").click(function() {
		// Присваиваем предыдущей яйчейке текст
		if (selected_cell != null) {
			moveValueToCell();
			selected_cell.css("box-shadow", "none");
		}

		// Выбираем
		selected_cell = $(this);
		let index = selected_cell.index() + 1;
		selected_column = $("td:nth-child(" + index + ")");

		// Активируем поле ввода
		input_cell_content.val(selected_cell.text());
		input_cell_content.focus();

		selected_cell.css("box-shadow", "0px 0px 4px 4px #9E9E9E inset");
	});
}

// Передаёт значение из поля ввода в яйчейку
// А так же обновляет разметку
function moveValueToCell() {
	if (selected_cell.contents().length == 1) {
		// У этой яйчейки не было текста, добавляем
		selected_cell.append(input_cell_content.val());
	} else {
		// У этой яйчейки был текст, заменяем
		selected_cell.contents().filter(function(){return this.nodeType==3;}).first().replaceWith(input_cell_content.val());
	}
	markup_body = getMarkupBody();
	markup_pre.innerHTML = markup_head + markup_body;
}

// Устанавливает стиль выравнивания текста колонке таблицы
function setColumnAlignment(align) {
	selected_column.css("text-align", align);
	markup_head = getMarkupHead();
	markup_pre.innerHTML = markup_head + markup_body;
}

// Считывает значения ширин столбцов таблицы и генерирует первую строку таблицы
function getMarkupHead() {
	let output = "@" + input_title.value;

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

// Копирует разметку
function copyMarkup() {
	navigator.clipboard.writeText(markup_pre.textContent).then(alert("Успешно скопировано"));
}
