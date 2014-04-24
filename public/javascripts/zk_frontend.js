function showSubTree(parent, children, dontAnimate) {
    var childrenSpan = $(this).parent().children("span");
    var totalLength = $(this).parent().width();
    var nodeChildrenSize = $(this).siblings('ul').children().size();
    var heightDiff;
    var heightBefore = parent.height();
    if(nodeChildrenSize> 0){
        var leftHeight = (nodeChildrenSize+1)*38;
        parent.height(leftHeight);
        heightDiff = leftHeight-heightBefore;
    } else {
        parent.height(28);
        heightDiff = 28 -heightBefore;
    }

    ($(parent).parents("li.parent_li")).each(function(index, grandParent){
        $(grandParent).height($(grandParent).height()+heightDiff);
    });

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
    var openChildren = $(children).filter(".open");
    for(var i = 0; i< openChildren.length; i++){
        var toClose = $(openChildren[i]).children("span.title");
        hideSubTree.call(toClose,openChildren[i],$(openChildren[i]).find(' > ul > li'));
    }
    $(parent).css("height","");
    $(this).siblings(".line").width("0px");
    $(parent).removeClass("open");
    $(parent).next().removeClass("after-open");
    if(!possibleChild || parent.has(possibleChild).length==0 ){
        children.hide('fast');
        $(this).attr('title', 'Expand this branch').find('> i').addClass('glyphicon-plus').removeClass('glyphicon-minus');
    }
    var parents = $(parent).parent().closest('.parent_li');

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
    currentlyOpens = $('.tree li.parent_li > span');
    for(var currentlyOpen in currentlyOpens) {
        var parent = $(currentlyOpen).parent('li.parent_li');
        var children = parent.find(' > ul > li');
        showSubTree.call(currentlyOpen, parent, children, true);
    }
}
$(function () {
    $('.tree li').addClass('parent_li').find('> span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span.title').on('click', function (e) {
        var parent = $(this).parent('li.parent_li');
        var children = parent.find(' > ul > li');
        if (children.is(":visible")) {

            hideSubTree.call(this, parent, children);
        } else {
            if($(parent).hasClass('open')){
                hideSubTree.call(this, parent, children);
            } else {
                showSubTree.call(this, parent, children);
            }
        }
        e.stopPropagation();
    });
    $('.tree li.parent_li > span').parent('li.parent_li').find('> ul > li').hide('fast');
    $(window).resize(resizeViewport);
    $('.tree li.parent_li > span.title').hover(nodeHover, nodeHoverOut);
});