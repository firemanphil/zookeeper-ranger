var currentlyOpen;
function showSubTree(parent, children, dontAnimate) {
    var childrenSpan = $(this).parent().children("span");
    var totalLength = $(this).parent().width();
    var toFill = totalLength;
    for (var i = 0; i < childrenSpan.length; i++) {
        if(!$(childrenSpan[i]).hasClass("line")){
        toFill -= $(childrenSpan[i]).outerWidth();
        }
    }
    if(dontAnimate){
        $(this).siblings(".line").width(toFill + "px");
    }else {
        $(this).siblings(".line").animate({width: toFill + "px"}).fadeIn();
    }
    $(this).siblings(".data").fadeIn();
    parent.addClass("open");

    children.show('fast');
    $(this).attr('title', 'Collapse this branch').find(' > i').addClass('glyphicon-minus').removeClass('glyphicon-plus');
}
function hideSubTree(parent, children, possibleChild) {
    var childrenSpan = $(this).siblings("span");
    for (var i = 0; i < childrenSpan.length; i++) {
        $(childrenSpan[i]).hide();
    }
    $(this).siblings(".line").width("0px");
    parent.removeClass("open");
    parent.next().removeClass("after-open");
    if(!possibleChild || parent.has(possibleChild).length==0){
        children.hide('fast');
        $(this).attr('title', 'Expand this branch').find(' > i').addClass('glyphicon-plus').removeClass('glyphicon-minus');
    }
}
function resizeViewport() {
    var parent = $(currentlyOpen).parent('li.parent_li');
    var children = parent.find(' > ul > li');
    showSubTree.call(currentlyOpen, parent, children, true);
}
$(function () {
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var parent = $(this).parent('li.parent_li');
        var children = parent.find(' > ul > li');
        if (children.is(":visible")) {

            hideSubTree.call(this, parent, children);
        } else {
            if(currentlyOpen){
                var currOpenParent = $(currentlyOpen).parent('li.parent_li');
                hideSubTree.call(currentlyOpen, currOpenParent, currOpenParent.find(' > ul > li'),this);
            }
            showSubTree.call(this, parent, children);
            currentlyOpen = this;
        }
        e.stopPropagation();
    });
    $('.tree li.parent_li > span').parent('li.parent_li').find(' > ul > li').hide('fast');
    $(window).resize(resizeViewport);
});