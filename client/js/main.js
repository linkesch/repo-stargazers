'use strict';

$(function () {

	$('#form').on('submit', function (e) {
		var owner = $('#form-owner').val(),
			repo = $('#form-repo').val(),
			$results = $('#results');

		e.preventDefault();

		$results.html('<span class="fa fa-spinner fa-spin"></span> Loading...');
		$.ajax({
			url: 'http://localhost:3000/get/'+ owner +'/'+ repo,
			dataType: 'json',
			success: function (data) {

				if (data.code && data.code === 'error') {
					$results.html('<div class="alert alert-danger">'+ data.message +'</div>');
					return;
				}

				var $list = $('<ul></ul>');
				$results.html('<h2>Top 10 users who starred your repo:</h2>');
				$results.append($list);

			 	$.each(data, function (key, value) {
			 		$list.append('<li>'+
			 			'<a href="https://github.com/'+ value.name +'">'+
			 				'<img src="'+ value.avatar +'" alt="'+ value.name  +'">'+
			 				'<span class="name">'+ value.name +':</span>'+
			 			'</a> '+
			 			'<span class="stars">'+ value.stars +' <span class="fa fa-star"></span></span>'+
			 		'</li>');
			 	});

			},
			error: function () {
				$results.html('<div class="alert alert-danger">An unexpected error occured.</div>');
			}
		});
	});

});