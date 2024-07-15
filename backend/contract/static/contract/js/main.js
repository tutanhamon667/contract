const app = function() {

    const makeRequest = function(url, data, callback) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        $.ajax({
            url: `/api/${url}`,
            data: data,
            beforeSend: function(request) {
                request.setRequestHeader("X-CSRFToken", csrftoken);
            },
            method: "POST",
            success: (data) => {
                callback(true, data)
            },
            error: (data) => {
                callback(false, data)
            }
        })
    }

    const initRating = function(el, inputSelector, editable = true) {

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
        if (editable)
            $star_rating.on('click', function() {
                $star_rating.siblings(inputSelector).val($(this).data('rating'));
                //$star_rating.siblings('input.rating-value').val($(this).data('rating'));
                return SetRatingStar();
            });
        SetRatingStar();
    }

    const radioInputChecker = (radio, value, input) => {
        $(input).attr("disabled", "disabled")

        $(radio).on("change", function() {
            if (parseInt($(this).val()) !== parseInt(value)) {
                $(input).attr("disabled", "disabled")
            } else {
                $(input).removeAttr("disabled")
            }

        })
    }

    const radioMultiSelectChecker = (radio, value, input, pseudo_el) => {
        console.log($(radio).val())
        if (document.querySelector(radio + ':checked').value !== value) {
            $(input).each(function(item) {
                $(this).attr("disabled", "disabled")
            })
            $(pseudo_el).attr("disabled", "disabled")
        }

        $(radio).on("change", function() {
            console.log(document.querySelector(radio + ':checked').value)
            if (document.querySelector(radio + ':checked').value !== value) {
                $(input).each(function(item) {
                    $(this).attr("disabled", "disabled")
                })
                $(pseudo_el).attr("disabled", "disabled")
            } else {
                $(input).each(function(item) {
                    $(this).removeAttr("disabled")
                })
                $(pseudo_el).removeAttr("disabled")
            }

        })
    }

    const industrySpecInit = () => {
        if ($('#specialisation').val()) {
            const ind_id = $('#specialisation>option[value="' + $('#specialisation').val() + '"]').attr('parent')
            $('[name="industry"][value="' + ind_id + '"]').click()
        }
        $('[name="industry"]').on("change", function() {
            const ind_id = $(this).val()
            let first_show_item = false
            $('#specialisation>option').each(function(index) {
                if ($(this).attr("parent") !== ind_id) {
                    $(this).hide()
                } else {
                    if (first_show_item === false) {
                        first_show_item = index
                    }

                    $(this).show()
                }
            })
            const selectElement = document.getElementById('specialisation');
            selectElement.selectedIndex = first_show_item;

        })
    }
    const profileJobsFilters = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const filterForm = $('.profile_jobs_filter_form')
        const status = $(filterForm).find('[name="status"]')
        const page = $(filterForm).find('[name="page"]')

        $("[name=\"status_radio\"]").on("change", function(el) {
            switch ($(this).attr('id')) {
                case 'status_0':
                    $(status).val(0)
                    break;
                case 'status_1':
                    $(status).val(1)
                    break;
            }
            $(filterForm).submit()
        })
    }

    const deleteJobHandler = (id) => {
        let text = "Вы действительно хотите удалить вакансию?";
        if (confirm(text) == true) {
            window.location.href = `/profile/jobs/delete/${id}`
        }
    }

    const favoriteJobCheckboxHandler = () => {
        $('.favorite_job_checkbox').on('change', function(e) {
            const callback = (res, data) => {
                console.log(res)
                console.log(data)
            }
            makeRequest('favorite', {
                job_id: $(this).attr('value'),
                value: $(this).is(':checked')
            }, callback)
        })
    }

    const getFavoriteJobs = () => {
        const callback = (res, data) => {
            console.log(res)
            console.log(data)
        }
        makeRequest('get_favorite', {}, callback)

    }

    const jobFilterSubmit = () => {
        $('#filter_form').on('submit', function(e) {
            e.preventDefault()
            const params = new FormData(this);
            const object = {};
            params.forEach((value, key) => {
                if (typeof object[key] == 'undefined') {
                    object[key] = value
                } else {
                    if (Array.isArray(object[key])) {
                        object[key].push(value)
                    } else {
                        object[key] = [object[key], value]

                    }
                }

            });
            getJobs(object)
        })
    }

    const getJobs = (data = {}) => {
        const callback = (res, data) => {
            console.log(res)
            console.log(data)
        }
        makeRequest('jobs', data, callback)

    }

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                $('#profilePhoto').attr('src', e.target.result).width(90).height(90);
            };

            reader.readAsDataURL(input.files[0]);
        }
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
        $(orderBtn).click(function() {
            order_val = order_val === "desc" ? "asc" : "desc"
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
        deleteJobHandler: deleteJobHandler,
        industrySpecInit: industrySpecInit,
        readURL: readURL,
        initRating: initRating,
        profileResponseInvitesFilters: profileResponseInvitesFilters,
        radioInputChecker: radioInputChecker,
        profileJobsFilters: profileJobsFilters,
        favoriteJobCheckboxHandler: favoriteJobCheckboxHandler,
        getJobs: getJobs,
        jobFilterSubmit: jobFilterSubmit,
        radioMultiSelectChecker: radioMultiSelectChecker
    }
}