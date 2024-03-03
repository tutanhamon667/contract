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

    const radioInputChecker = (radio,value, input) => {
        if (parseInt($(radio).val()) === parseInt(value)){
                $(input).attr("disabled", "disabled")
            }else{
                $(input).removeAttr("disabled")
            }
        $(radio).on("change", function() {
            if (parseInt($(this).val()) === parseInt(value)){
                $(input).attr("disabled", "disabled")
            }else{
                $(input).removeAttr("disabled")
            }

        })
    }

    const profileResponseInvitesFilters = () => {
        const orderBtn = $('#order')
        const searchParams = new URLSearchParams(window.location.search);
        let order_val = searchParams.get('order')
        const filterForm = $('.response_invite_filter_form')
        const status = $(filterForm).find('[name="status"]')
        const type = $(filterForm).find('[name="type"]')
        const order_date = $(filterForm).find('[name="order"]')
        const page = $(filterForm).find('[name="page"]')
        $(orderBtn).click(function () {
            order_val = order_val === "desc" ?  "asc": "desc"
            $(order_date).val(order_val)
            $(filterForm).submit()
        })
        $("[name=\"status_radio\"]").on("change", function(el) {
            console.log($(this).attr('id'))
            switch ($(this).attr('id')) {
                case 'type_1':
                    $(type).val(1)
                    $(status).val('any')
                    break;
                case 'type_0':
                    $(type).val(0)
                    $(status).val('any')
                    break;
                case 'status_1':
                    $(type).val(null)
                    $(status).val(1)
                    break;

            }
            $(filterForm).submit()
        })
    }
    return {
        initRating:initRating,
        profileResponseInvitesFilters:profileResponseInvitesFilters,
        radioInputChecker:radioInputChecker
    }
}


