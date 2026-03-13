document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("todoInput");
    const checkList = document.querySelector(".check-list");
    const originalUl = document.querySelector(".check-list ul");
    const readerList = document.getElementById("readerList");
    let newUl = null;
    let draggedItem = null;
    let responsiveDiv = null;

    const filterItems = document.querySelectorAll(".check-list li:nth-child(2), .check-list li:nth-child(3), .check-list li:nth-child(4)");
    const itemsLeftSpan = originalUl.querySelector("span");
    // let taskAddedOnce = false;
    const defaultPlaceholder = input.placeholder;

    // バツボタン用の span を作成
    const now = new Date();
    const hour = now.getHours();
    const body = document.body;
    const bgImage = document.getElementById("bgImage");
    const icon = document.getElementById("todoIcon");
    // const main = document.getElementById("main");
    // const footer = document.getElementById("footer");

    if (hour >= 18 || hour < 6) {
        // 夜用設定
        body.classList.add("night-mode");
        bgImage.src = "images/bg-desktop-light.jpg";
        icon.src = "images/icon-moon.svg";
    } else {
        body.classList.remove("night-mode");
        bgImage.src = "images/bg-desktop-dark.jpg";
        icon.src = "images/icon-sun.svg";
    }

    // ★ ここから追加 ★
    function handleResponsiveFilters() {
        const width = window.innerWidth;

        if (width <= 500) {
            // 元の li を非表示
            filterItems.forEach(li => li.style.display = "none");

            // 新しい div がなければ作る
            if (!responsiveDiv) {
                responsiveDiv = document.createElement("div");
                responsiveDiv.className = "responsive-div";

                ["All", "Active", "Completed"].forEach(text => {
                    const span = document.createElement("span");
                    span.textContent = text;

                    // 元の li と同じ表示切り替え処理を追加
                    span.addEventListener("click", () => {
                        const tasks = document.querySelectorAll("ul.task-list li");
                        if (text === "All") {
                            tasks.forEach(t => t.style.display = "flex");
                        }
                        if (text === "Active") {
                            tasks.forEach(t => {
                                t.style.display = t.classList.contains("completed") ? "none" : "flex";
                            });
                        }
                        if (text === "Completed") {
                            tasks.forEach(t => {
                                t.style.display = t.classList.contains("completed") ? "flex" : "none";
                            });
                        }
                    });

                    responsiveDiv.appendChild(span);
                });

                // 元の ul の次に追加
                checkList.appendChild(responsiveDiv);
            }
        } else {
            // 元の li を表示
            filterItems.forEach(li => li.style.display = "list-item");

            // 既存の div を削除
            if (responsiveDiv) {
                responsiveDiv.remove();
                responsiveDiv = null;
            }
        }
    }
    handleResponsiveFilters();
    window.addEventListener("resize", handleResponsiveFilters);

    // 未完了タスクの数を更新
    function updateItemsLeft() {
        if (!newUl) {
            itemsLeftSpan.textContent = 0;
            input.placeholder = defaultPlaceholder;
            return;
        }

        const incompleteTasks = newUl.querySelectorAll("li:not(.completed)");
        itemsLeftSpan.textContent = incompleteTasks.length;

        if (incompleteTasks.length === 0) {
            input.placeholder = defaultPlaceholder; // 元に戻す
        } else {
            input.placeholder = "Create a new todo"; // 追加後の表示
        }
    }

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const text = input.value.trim();
            if (text === "") return;

            // newUl がまだない場合だけ作る
            if (!newUl) {
                newUl = document.createElement("ul");
                newUl.classList.add("task-list");
                checkList.insertBefore(newUl, originalUl);
            }

            const li = document.createElement("li");
            li.draggable = true;

            // ===== drag =====
            li.addEventListener("dragstart", () => {
                draggedItem = li;
                li.classList.add("dragging");
            });

            li.addEventListener("dragend", () => {
                li.classList.remove("dragging");
                draggedItem = null;
            });

            const checkWrapper = document.createElement("span");
            checkWrapper.classList.add("check-icon"); // CSSで擬似要素やhoverを制御

            const checkImg = document.createElement("img");
            checkImg.src = "images/icon-check.svg"; // チェック印画像のパス
            checkImg.alt = "check";
            checkWrapper.appendChild(checkImg);
            li.appendChild(checkWrapper);

            // タスクの文字
            const span = document.createElement("span");
            span.textContent = text;
            li.appendChild(span);


            // ✅ バツ印 (ここに組み込む)
            const deleteBtn = document.createElement("span");
            deleteBtn.classList.add("delete-btn");

            const deleteImg = document.createElement("img");
            deleteImg.src = "images/icon-cross.svg"; // 画像のパス
            deleteImg.alt = "delete";
            deleteImg.width = 16; // 好きなサイズ
            deleteImg.height = 16;

            deleteBtn.appendChild(deleteImg);
            li.appendChild(deleteBtn);

            // クリックでタスク削除
            deleteBtn.addEventListener("click", () => {
                li.remove();
                updateItemsLeft();
            });

            checkWrapper.addEventListener("click", function () {
                li.classList.toggle("completed"); // li に completed クラスを付け外し
                updateItemsLeft();
            });

            newUl.appendChild(li);
            input.value = "";

            // 1つでも追加したことがある
            // taskAddedOnce = true;
            input.placeholder = "Create a new todo";

            updateItemsLeft();
        }
    });

    // ===== reader list（ドロップ先）=====
    readerList.addEventListener("dragover", (e) => {
        e.preventDefault();

        if (draggedItem) {
            // ドラッグ中のアイテムの下線を消す
            draggedItem.style.borderBottom = "none";
        }
    });

    readerList.addEventListener("drop", () => {
        if (!draggedItem) return;
        readerList.appendChild(draggedItem);
        updateItemsLeft();
    });

    // 「Clear Completed」ボタン
    const clearBtn = document.querySelector(".check-list li:nth-child(5)");
    clearBtn.addEventListener("click", () => {
        // 完了済みのタスク li を全て取得
        const completedTasks = document.querySelectorAll("ul.task-list li.completed");
        completedTasks.forEach(task => task.remove()); // li を削除
        updateItemsLeft();
    });

    // Completed ボタン（4番目の li）
    const completedBtn = document.querySelector(".check-list li:nth-child(4)");
    completedBtn.addEventListener("click", () => {
        const allTasks = document.querySelectorAll("ul.task-list li");
        allTasks.forEach(task => {
            if (task.classList.contains("completed")) {
                task.style.display = "flex"; // 表示
            } else {
                task.style.display = "none"; // 非表示
            }
        });
    });

    // Active ボタン（3番目の li）
    const activeBtn = document.querySelector(".check-list li:nth-child(3)");
    activeBtn.addEventListener("click", () => {
        const allTasks = document.querySelectorAll("ul.task-list li");
        allTasks.forEach(task => {
            if (!task.classList.contains("completed")) {
                task.style.display = "flex"; // 表示
            } else {
                task.style.display = "none"; // 非表示
            }
        });
    });

    // All ボタン（2番目の li）
    const allBtn = document.querySelector(".check-list li:nth-child(2)");
    allBtn.addEventListener("click", () => {
        const allTasks = document.querySelectorAll("ul.task-list li");
        allTasks.forEach(task => task.style.display = "flex"); // 全表示
    });
});

