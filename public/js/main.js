$(document).ready(function() {
    const faculty = [
    "Công Nghệ Thông tin", 
    "Toán", 
    "Kế Toán", 
    "Dược",
    "Điện-Điện tử",
    "Giáo dục quốc tế",
    "Khoa học ứng dụng",
    "Khoa học xã hội và nhân văn",
    "Kỹ thuật công trình",
    "Lao động và công đoàn",
    "Luật",
    "Kỹ thuật công trình",
    "Ngoại ngữ",
    "Tài chính ngân hàng",
    "Kinh doanh quốc tế",
    "Toán-Thống kê"]
    var facultyBody = ""
    for (var i in faculty){
        facultyBody += `
            <li>&ensp; `+ faculty[i]+`</li>
            
        `
    }
    $("#dropdown-faculty").html(facultyBody)
    $(".dropdown-faculty").html(facultyBody)

    const fields = [
        "Học thuật", 
        "Tình nguyện", 
        "Hoạt động"]
        var fieldsBody = ""
        for (var i in fields){
            fieldsBody += `
                <li>&ensp; `+ fields[i]+`</li>
                
            `
        }
    $(".dropdown-fields").html(fieldsBody)

    var date = new Date()
    var time = date.getFullYear() + '-' + (date.getMonth()+1) +'-'+ date.getDate()
    $('#post_content_from_date').val(time)
    $('#post_content_to_date').val(time)

    var reader = new FileReader()
    
    $(".custom-file-input").on("change", function(myfile) {
        // console.log(myfile.target.files[0])
    
        reader.onload = function(event){
            $('#post_img_preview_r').attr('src',event.target.result)
        }
        reader.readAsDataURL(myfile.target.files[0])
        $(this).siblings(".custom-file-label").addClass("selected").html($(this).val().split("\\").pop());
    });


    $("#customFile_u").on("change", function(myfile) {
        // console.log(myfile.target.files[0])
        reader.onload = function(event){
            $('#post_img_preview_u').attr('src',event.target.result)
        }
        reader.readAsDataURL(myfile.target.files[0])
        $(this).siblings(".custom-file-label").addClass("selected").html($(this).val().split("\\").pop());
    });

    $("#customFile_avatar").on("change", function(myfile) {
        // console.log(myfile.target.files[0])
        reader.onload = function(event){
            $('#edit_profile_avatar').attr('src',event.target.result)
        }
        reader.readAsDataURL(myfile.target.files[0])
        $(this).siblings(".custom-file-label").addClass("selected").html($(this).val().split("\\").pop());
    });
    
    $("#dropdown-faculty li").click((event) => {
        $("#register_department").val(event.target.innerHTML.trim())
    })
    $(".dropdown-fields li").click((event) => {
        $("#post_content_field").val(event.target.innerHTML.trim())
        $("#post_content_field_u").val(event.target.innerHTML.trim())
    })
    $(".dropdown-faculty li").click((event) => {
        $("#post_content_faculty").val(event.target.innerHTML.trim())
    })

    $("#post_content_from_date").change(()=> {
        if ($("#post_content_from_date").val() > $("#post_content_to_date").val()){
            $("#post_content_from_date").val($("#post_content_to_date").val())
        }
        var timeX = new Date($("#post_content_from_date").val())
        var timeY = new Date(time)
        if (timeX < timeY){
            $("#post_content_from_date").val(time)
        }
    })

    $("#post_content_to_date").change(()=> {
        if ($("#post_content_to_date").val() < $("#post_content_from_date").val()){
            $("#post_content_to_date").val($("#post_content_from_date").val())
        }
    })

    $("#post_content_from_date_u").change(()=> {
        if ($("#post_content_from_date_u").val() > $("#post_content_to_date_u").val()){
            $("#post_content_from_date_u").val($("#post_content_to_date_u").val())
        }
    })

    
    $("#post_content_to_date_u").change(()=> {
        if ($("#post_content_to_date_u").val() < $("#post_content_from_date_u").val()){
            $("#post_content_to_date_u").val($("#post_content_from_date_u").val())
        }
    })
})

function updatePostByID(id, content, linkImg, from, to, field){
    console.log(id)
    $('#post_id_u').val(id)
    $('#post_content_text_u').val(content)
    $('#post_content_from_date_u').val(from)
    $('#post_content_to_date_u').val(to)
    $('#post_img_preview_u').attr('src', linkImg)
    $("#post_content_field_u").val(field)
}

function deletePostByID(id){
    $('#post_id_d').val(id)
}
function editProfile(id, name, faculty){
    $('.club_id').val(id)
    $('#edit_profile_name').val(name)
    $("#post_content_faculty").val(faculty)
}
function editBio(id, bio){
    $('.club_id').val(id)
    $('#club_bio').val(bio)
}

function showComment(){
    var isShow = $('.posts_comment_show').attr('hidden')
    $('.posts_comment_show').attr('hidden', !isShow)
    
}

function banPost(id){
    $('#post_id_ban').val(id)
}
function allowPost(id){
    $('#post_id_allow').val(id)
}

function showDetails(id, name, avatar, bio, isBan) {
    $('#detail-name').html(name)
    $('#detail-avatar').attr('src',avatar)
    $('#detail-bio').html(bio)
    $('#detail-bio').css('color', "#000")

    var message = ""
    var color = ""
    if (isBan == true.toString()) {
        message = "bị chặn"
        color = "#dc3545"
        $('#confirm-ban-unban').html("Bỏ chặn")
        $('#confirm-ban-unban').removeClass('btn-danger').addClass('btn-primary')
        $('#ban_action').val(false.toString())
    } else {
        message = "được phép"
        color = "#007bff"
        $('#confirm-ban-unban').html("Chặn")
        $('#confirm-ban-unban').removeClass('btn-primary').addClass('btn-danger')
        $('#ban_action').val(true.toString())
    }

    $('#detail-ban').html(message)
    $('#detail-ban').css('color', color)

    $('#ban_user_id').val(id)
}

function checkDetails(id, name, avatar, bio, isBan) {
    $('#check-name').html(name)
    $('#check-avatar').attr('src',avatar)
    $('#check-bio').html(bio)
    $('#check-bio').css('color', "#000")

    var message = ""
    var color = ""
    if (isBan == true.toString()) {
        message = "bị chặn"
        color = "#dc3545"
    } else {
        message = "được phép"
        color = "#007bff"
    }

    $('#check-ban').html(message)
    $('#check-ban').css('color', color)

    $('#check_user_id').val(id)
}

