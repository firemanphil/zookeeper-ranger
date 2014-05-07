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
    $(this).siblings(".line").data("orig_width",toFill);
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
function hideSubTree(parent, children, correctHeights, possibleChild) {
    var heightBefore = $(parent).height();
    var childrenSpan = $(this).siblings("span");
    for (var i = 0; i < childrenSpan.length; i++) {
        $(childrenSpan[i]).hide();
    }
    var openChildren = $(children).filter(".open");
    for(var i = 0; i< openChildren.length; i++){
        var toClose = $(openChildren[i]).children("span.title");
        hideSubTree.call(toClose,openChildren[i],$(openChildren[i]).find(' > ul > li'), false);
    }

    $(parent).css("height","");
    $(this).siblings(".line").stop().width("0px");
    $(parent).removeClass("open");
    $(parent).next().removeClass("after-open");
    if(!possibleChild || parent.has(possibleChild).length==0 ){
        var childrenCount = children.length;
        children.hide('fast', function(){
            if(childrenCount==1) {
                if (correctHeights) {
                    var heightDiff = heightBefore - $(parent).height();
                    ($(parent).parents("li.parent_li")).each(function (index, grandParent) {
                        $(grandParent).height($(grandParent).height() - heightDiff);
                    });
                }
            }
            childrenCount --;
        });
        $(this).attr('title', 'Expand this branch').find('> i').addClass('glyphicon-plus').removeClass('glyphicon-minus');
    }


}
function nodeHover(args){
    var parent = $(this).parent('li.parent_li');
    parent.children('span.data, span.title').addClass('hovered');
    parent.children('ul').find('li > span.title').addClass('hovered');
    var old_width = $(parent).children("span.line").data("orig_width") || $(parent).children("span.line").width();
    if(parent.children('span.data:visible').length != 0) {
        $(parent).children("span.line:visible").stop().animate({"width":old_width},{duration: 100, queue: false});
    }
    $(parent).children('span.title_edit_button').show().stop().animate({"margin-left": "-5px"}, { duration: 100, queue: false });
}
function nodeHoverOut(args) {
    var parent = $(this).parent('li.parent_li');
    parent.children('span').removeClass('hovered');
    parent.children('ul').find('li > span.title').removeClass('hovered');
    if(($(parent).find(args.relatedTarget).length==0 || !$(args.relatedTarget).is("span"))
        || $(parent).is(args.relatedTarget)) {
        var old_width = $(parent).children("span.line").data("orig_width");
        if(parent.children('span.data:visible').length != 0) {
            var lineWidth = old_width + 30;
            $(parent).children("span.line:visible").stop().animate({"width": lineWidth}, {duration: 300, queue: false});
        }
        $(parent).children('span.title_edit_button').stop().animate({"margin-left": "-35px"}, { duration: 300, queue: false });
    }
}
function editHoverOut(args){
    var parent = $(this).parent('li.parent_li');
    if($(parent).find(args.relatedTarget).length==0){
        $(parent).children('span.title_edit_button').animate({"margin-left": "-35px"}, 300);
    }

}
function resizeViewport() {
    currentlyOpens = $('.tree li.parent_li > span');
    for(var currentlyOpen in currentlyOpens) {
        var parent = $(currentlyOpen).parent('li.parent_li');
        var children = parent.find(' > ul > li');
        showSubTree.call(currentlyOpen, parent, children, true);
    }
}
function onNodeClick(e) {
    var parent = $(this).parent('li.parent_li');
    var children = parent.find(' > ul > li');
    if (children.is(":visible")) {

        hideSubTree.call(this, parent, children, true);
    } else {
        if ($(parent).hasClass('open')) {
            hideSubTree.call(this, parent, children, true);
        } else {
            showSubTree.call(this, parent, children);
        }
    }
    e.stopPropagation();
}
function onEditClick(e) {
    e.stopPropagation();
    $(this).siblings('span.title').editable({
        type: 'text',
        placement: 'top',
        title: 'Enter username'
    });
    $(this).siblings('span.title').attr('title','Enter node name');
    $($(this).siblings('span.title')[0]).editable('show');
}
$(function () {

    $('.tree li').addClass('parent_li').find('> span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span.title').on('click', onNodeClick);
    $('.tree li.parent_li > span.title_edit_button').on('click',onEditClick);
    $('.tree li.parent_li > span').parent('li.parent_li').find('> ul > li').hide('fast');
    $(window).resize(resizeViewport);
    $('.tree li.parent_li > span.title').hover(nodeHover, nodeHoverOut);
    $('.tree li.parent_li > span.title_edit_button').hover(function(){}, editHoverOut)
});