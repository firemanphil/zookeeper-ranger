var currentlyOpen;
function showSubTree(parent, children, dontAnimate) {
    var childrenSpan = $(this).parent().children("span");
    var totalLength = $(this).parent().width();
    var nodeChildrenSize = $(this).siblings('ul').children().size();
    if(nodeChildrenSize> 0){
        var leftHeight = (nodeChildrenSize+1)*38;
        parent.height(leftHeight);
    } else {
        parent.height(28);
    }

    var rightHeight = $(this).siblings(".data").height();
    $(this).siblings('ul').css("position","relative");

    $(this).siblings('ul').css("top", +(20-rightHeight)+"px");
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

    $(this).attr('title', 'Collapse this branch').find('> i').addClass('glyphicon-minus').removeClass('glyphicon-plus');
}
function hideSubTree(parent, children, possibleChild) {
    var childrenSpan = $(this).siblings("span");
    for (var i = 0; i < childrenSpan.length; i++) {
        $(childrenSpan[i]).hide();
    }
    parent.css("height","");
    $(this).siblings(".line").width("0px");
    parent.removeClass("open");
    parent.next().removeClass("after-open");
    if(!possibleChild || parent.has(possibleChild).length==0 ){
        children.hide('fast');
        $(this).attr('title', 'Expand this branch').find('> i').addClass('glyphicon-plus').removeClass('glyphicon-minus');
    }
    var parents = $(parent).parent().closest('.parent_li');
    if(parents.length > 0){
        currentlyOpen = $(parents[0]).children('span.title');
    } else {
        // we are at the top
        currentlyOpen = undefined;
    }
}
function nodeHover(){
    var parent = $(this).parent('li.parent_li');
    parent.children('span.data, span.title').addClass('hovered');
    parent.children('ul').find('li > span.title').addClass('hovered');
}
function nodeHoverOut(){
    var parent = $(this).parent('li.parent_li');
    parent.children('span').removeClass('hovered');
    parent.children('ul').find('li > span.title').removeClass('hovered');
}

function resizeViewport() {
    var parent = $(currentlyOpen).parent('li.parent_li');
    var children = parent.find(' > ul > li');
    showSubTree.call(currentlyOpen, parent, children, true);
}
$(function () {
    $('.tree li:has(ul)').addClass('parent_li').find('> span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var parent = $(this).parent('li.parent_li');
        var children = parent.find(' > ul > li');
        if (children.is(":visible")) {

            hideSubTree.call(this, parent, children);
        } else {
            var oldCurrentlyOpen = currentlyOpen;
            if(oldCurrentlyOpen){
                var currOpenParent = $(oldCurrentlyOpen).parent('li.parent_li');
                if(this===oldCurrentlyOpen){
                    hideSubTree.call(oldCurrentlyOpen, currOpenParent, currOpenParent.find(' > ul > li'));
                } else {
                    hideSubTree.call(oldCurrentlyOpen, currOpenParent, currOpenParent.find(' > ul > li'), this);
                }
            }
            if(this !== oldCurrentlyOpen) {
                showSubTree.call(this, parent, children);
                currentlyOpen = this;
            }
        }
        e.stopPropagation();
    });
    $('.tree li.parent_li > span').parent('li.parent_li').find('> ul > li').hide('fast');
    $(window).resize(resizeViewport);
    $('.tree li.parent_li > span.title').hover(nodeHover, nodeHoverOut);
});