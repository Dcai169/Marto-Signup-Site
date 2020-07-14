$(".target").change(function () {
    alert("Handler for .change() called.");
});

$("#other").click(function () {
    $(".target").change();
});

console.log("foo");