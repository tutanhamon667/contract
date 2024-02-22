const app = function() {
    const initRating = function(el, inputSelector, editable=true){

        const $star_rating = el //$('.star-rating .fa');

        const SetRatingStar = function() {
          return $star_rating.each(function() {
            if (parseInt($star_rating.siblings(inputSelector).val()) >= parseInt($(this).data('rating'))) {
              return $(this).removeClass('fa-star-o').addClass('fa-star');
            } else {
              return $(this).removeClass('fa-star').addClass('fa-star-o');
            }
          });
        };
        if(editable)
            $star_rating.on('click', function() {
                 $star_rating.siblings(inputSelector).val($(this).data('rating'));
              //$star_rating.siblings('input.rating-value').val($(this).data('rating'));
              return SetRatingStar();
            });
        SetRatingStar();
    }
    return {
        initRating:initRating
    }
}


