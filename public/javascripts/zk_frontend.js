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
    $(parent).children('span.title_edit_button').animate({"margin-left":"-5px"}, 100);
}
function nodeHoverOut(args) {
    var parent = $(this).parent('li.parent_li');
    parent.children('span').removeClass('hovered');
    parent.children('ul').find('li > span.title').removeClass('hovered');
    if(($(parent).find(args.relatedTarget).length==0 || !$(args.relatedTarget).is("span"))
        || $(parent).is(args.relatedTarget)) {
        $(parent).children('span.title_edit_button').animate({"margin-left": "-35px"}, 300);
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
$(function () {
    $('span.title.text').editable({
        type: 'text',
        title: 'Enter username',
        success: function(response, newValue) {
            console.log(newValue);
            console.log(response);
        }
    });
    $('.tree li').addClass('parent_li').find('> span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span.title').on('click', function (e) {
        var parent = $(this).parent('li.parent_li');
        var children = parent.find(' > ul > li');
        if (children.is(":visible")) {

            hideSubTree.call(this, parent, children, true);
        } else {
            if($(parent).hasClass('open')){
                hideSubTree.call(this, parent, children,true);
            } else {
                showSubTree.call(this, parent, children);
            }
        }
        e.stopPropagation();
    });
    $('.tree li.parent_li > span').parent('li.parent_li').find('> ul > li').hide('fast');
    $(window).resize(resizeViewport);
    $('.tree li.parent_li > span.title').hover(nodeHover, nodeHoverOut);
    $('.tree li.parent_li > span.title_edit_button').hover(function(){}, editHoverOut)
});