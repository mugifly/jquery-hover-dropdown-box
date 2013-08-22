/**
 * jquery-hover-dropdown-box	- v1.0.0 (alpha)
 * (c) Masanori Ohgita - 2013.
 * https://github.com/mugifly/jquery-hover-dropdown-box/
 * License: MIT
**/

(function($){

	/**
		Containers Array
	**/
	var hoverDropdownBoxs = new Array();

	/**
		Container Object
	**/
	var hoverDropdownBox = function( obj, options ){
		this.parentDOM = obj; // parentObject
		this.options = options;

		this.dom = null;
		this.isVisible = true;
		this.items = new Array(); // hoverDropdownBoxItem
		this.footerItem = null; // hoverDropdownBoxItem

		// Initialize
		this.id = hoverDropdownBoxs.length;
		this.init();
		hoverDropdownBoxs.push(this);

		this.options.hoverDropdownBox_id = this.id;
		this.options.getHoverDropdownBox = function(){
			return hoverDropdownBoxs[ this.hoverDropdownBox_id ];
		};

		// Append to parent dom
		if(!this.options.isInline){ // Hover
			this.appendToParent();
		}

	};

	// Initialize
	hoverDropdownBox.prototype.init = function( opt_container ){
		// Generate of container
		var $container;
		if( opt_container == null ){
			$container = jQuery('<div/>');
			$container.addClass('popup_dropdown_box');
			$container.data('hoverDropdownBoxId', this.id);
			this.dom = $container;
			this.parentDOM.append($container);
			if(this.options.isInline){
				$container.addClass('popup_dropdown_box_inline');
			} else {
				$container.addClass('popup_dropdown_box_hover');
			}
		} else {
			$container = opt_container;
			this.dom = $container;
		}

		// Generate of header
		var $header = jQuery('<h3/>');
		if(this.options.title == null){
			$header.html("&nbsp;");
		} else {
			$header.text( this.options.title);
		}
		$container.append($header);

		// Generate of list
		var $list = jQuery('<ul/>');
		$container.append($list);
		for ( key in this.options.items ){
			// Item
			var $li = jQuery('<li/>');
			$li.addClass('list_item');
			$li.data('hoverDropdownBoxBoxItemKey', key);
			$list.append($li);

			if( this.options.onClick != null ) { // Event: onClick
				$li.click(function(){
					var id = $($(this).parents('.popup_dropdown_box')[0]).data('hoverDropdownBoxId');
					var item_key = $(this).data('hoverDropdownBoxBoxItemKey')
					var item_obj = hoverDropdownBoxs[id].items[item_key];
					// options.onClick( item_key, item_object, dom_object )
					(hoverDropdownBoxs[id].options.onClick)(item_key, item_obj, this);
				});
			}

			if( this.options.onLabelClick != null ) { // Event: onLabelClick
				$li.click(function(evt){
					var id = $($(this).parents('.popup_dropdown_box')[0]).data('hoverDropdownBoxId');
					var item_key = $(this).data('hoverDropdownBoxBoxItemKey');
					var item_obj = hoverDropdownBoxs[id].items[item_key];
					// Check event source
					if(item_obj.innerInputObject != null && $(item_obj.innerInputObject).get(0) == $(evt.target).get(0)){
						return true;
					}
					// options.onLabelClick( item_key, item_object, dom_object )
					(hoverDropdownBoxs[id].options.onLabelClick)(item_key, item_obj, this);
				});
			}
			
			// Color tag
			if( this.options.items[key].color != null ){
				var color = this.options.items[key].color;
				var $color_tag = jQuery('<div/>');
				$color_tag.addClass('color_tag');
				$color_tag.html('&nbsp;');
				$color_tag.css('background-color', color);
				$li.append($color_tag);
			}

			// Label
			var $label = jQuery('<span/>')
			$label.addClass('label');
			$label.text(key);
			$li.append($label);

			// Item container object
			this.items[key] = new hoverDropdownBoxItem( this, $li, key );
			
			// Input object
			// Insert later
		}

		// Footer
		if(this.options.footer != null){
			$container.addClass('popup_dropdown_box_with_footer');

			// Item
			var $li = jQuery('<div/>');
			$li.addClass('list_item');
			$li.addClass('footer');
			$li.data('hoverDropdownBoxBoxItemKey', 'footer');
			$list.append($li);

			// Label
			var $label = jQuery('<span/>')
			$label.addClass('label');
			$label.text( this.options.footer.label );
			$li.append($label);

			// Item container object
			this.footerItem = new hoverDropdownBoxItem( this, $li, 'footer' );

			// Input object
			if(this.options.footer.inputType != null){
				this.footerItem.generateInputObject_( this.options.footer );
			}
		}

		// Input object
		for ( key in this.options.items ){
			if(this.options.items[key].inputType != null){
				this.items[key].generateInputObject_( this.options.items[key] );
			}
		}

	};

	// Append to parent dom
	hoverDropdownBox.prototype.appendToParent = function( ){
		$(this.parentDOM).data('hoverDropdownBoxId', this.id);
		$(this.parentDOM).hover(
			function(evt){ // Mouse-hover on parent
				var id = $(this).data('hoverDropdownBoxId');
				var $dom = hoverDropdownBoxs[id].dom;
				var $parentDOM = hoverDropdownBoxs[id].parentDOM;

				$dom.unbind('mouseout');
				if($dom.data('timeout') != null){
					window.clearTimeout( $dom.data('timeout') );
				}
				if($parentDOM.data('timeout') != null){
					window.clearTimeout( $parentDOM.data('timeout') );
				}

				// Show and adjust with parent element
				
				$dom.show();
				hoverDropdownBoxs[id].isVisible = true;
				var top_margin = 30;
				if(parseInt($(window).height()) <=  parseInt($parentDOM.offset().top - $(window).scrollTop()) + top_margin + parseInt($dom.height()) ){
					// Display to top of parent
					$dom.css('top', $parentDOM.offset().top + $parentDOM.height() - $dom.height() );
				} else {
					// Display to bottom of parent
					$dom.css('top', $parentDOM.offset().top + top_margin );
				}
				if(parseInt($(window).width()) < parseInt($parentDOM.offset().left) + parseInt($dom.width()) ){
					// Display to left of parent
					$dom.css('left', $parentDOM.offset().left - ($dom.width() / 2) );
				} else {
					// Display to right of parent
					$dom.css('left', $parentDOM.offset().left );
				}
				$dom.removeClass('popup_dropdown_box_hide');
				
				// Bind mouse-out event
				var t = window.setTimeout(function(){
					$dom.bind('mouseout', function(evt){
						console.log("mouseout from Dropdown");
						if( (evt.pageX < $dom.offset().left || $dom.offset().left + $dom.width() < evt.pageX ||
							evt.pageY < $dom.offset().top || $dom.offset().top + $dom.height() < evt.pageY)
							&& ( evt.pageX < $parentDOM.offset().left || $parentDOM.offset().left + $parentDOM.width() < evt.pageX ||
						evt.pageY < $parentDOM.offset().top || $parentDOM.offset().top + $parentDOM.height() < evt.pageY )){

							$dom.addClass('popup_dropdown_box_hide');
							var t = window.setTimeout(function(){
								console.log("mouseout from Dropdown -> hide");
								$dom.unbind('mouseout');
								$dom.hide();
								hoverDropdownBoxs[id].isVisible = false;
							}, 500);
							$dom.data('timeout', t);
						} else {
							if($dom.data('timeout') != null){
								window.clearTimeout( $dom.data('timeout') );
							}
						}
					});
				}, 500);
				$dom.data('timeout', t);
			},
			function(evt){ // Mouse-out from parent
				var id = $(this).data('hoverDropdownBoxId');
				var $dom = hoverDropdownBoxs[id].dom;
				var $parentDOM = hoverDropdownBoxs[id].parentDOM;
				if( evt.pageX < $dom.offset().left || $dom.offset().left + $dom.width() < evt.pageX ||
					evt.pageY < $dom.offset().top || $dom.offset().top + $dom.height() < evt.pageY ){
					console.log(" On mouse-out from parent && not on dom ");
					// Hide
					$dom.addClass('popup_dropdown_box_hide');
					var t = window.setTimeout(function(){
						console.log("mouseout from parent -> hide");
						$dom.unbind('mouseout');
						$dom.hide();
						hoverDropdownBoxs[id].isVisible = false;
					}, 500);
					$parentDOM.data('timeout', t);
				} else {
					if($dom.data('timeout') != null){
						window.clearTimeout( $dom.data('timeout') );
					}
				}
			}
		);
		
		// Hide now
		$(this.dom).addClass('popup_dropdown_box_hide');
		$(this.dom).hide();
		this.isVisible = false;
	};

	// Add item
	hoverDropdownBox.prototype.addItem = function( key, item ){
		this.options.items[key] = item;
		$(this.dom).children().remove();
		this.init( this.dom );
	};

	// Remove item
	hoverDropdownBox.prototype.removeItem = function( item_key ){
		// TODO!
	};

	/**
		Item Object
	**/
	var hoverDropdownBoxItem = function(hoverDropdownBox, dom_object, item_key){
		this.parentObject = hoverDropdownBox;
		this.key = item_key; // key or 'footer'
		this.dom = dom_object;
		this.labelObject = $(dom_object.children('.label'))[0];
		this.innerInputObject = null;
	};

	// Generate of input object
	hoverDropdownBoxItem.prototype.generateInputObject_ = function( item_options ){
		var input_type = item_options.inputType;

		// Checkbox (Checkbox like div)
		if( input_type == "checkbox" ){
			/*var $check = jQuery('<input/>');
			$check.attr('type', 'checkbox');
			$check.addClass('checkbox');
			if(item_options.inputSelected != null && item_options.inputSelected){
				$check.prop('checked', true);
			}*/
			var $check = jQuery('<div/>');
			$check.addClass('checkbox');
			if(item_options.inputSelected != null && item_options.inputSelected){
				$check.data('isChecked', true);
			} else {
				$check.data('isChecked', false);
			}

			$check.click(function(evt){
				var id = $($(this).parents('.popup_dropdown_box')[0]).data('hoverDropdownBoxId');
				var item_key =  $(this).parents('.list_item').data('hoverDropdownBoxBoxItemKey');
				var item_obj;
				if(item_key == 'footer'){
					item_obj = hoverDropdownBoxs[id].footerItem;
				} else {
					item_obj = hoverDropdownBoxs[id].items[item_key];
				}

				if($check.data('isChecked')){
					item_obj.checked( false );
				} else {
					item_obj.checked( true );
				}
			});

			this.dom.append($check);
			this.innerInputObject = $check;
		}

		// Textbox
		if( input_type == "text" ){
			var $text = jQuery('<input/>');
			$text.attr('type', 'text');
			$text.addClass('textbox');
			if(item_options.inputPlaceholder != null){
				$text.attr('placeholder', item_options.inputPlaceholder);
			}
			$text.hide();
			this.dom.click( function( evt ){
				var id = $($(this).parents('.popup_dropdown_box')[0]).data('hoverDropdownBoxId');
				var item_key = $(this).data('hoverDropdownBoxBoxItemKey');
				var item_obj;
				if(item_key == 'footer'){
					item_obj = hoverDropdownBoxs[id].footerItem;
				} else {
					item_obj = hoverDropdownBoxs[id].items[item_key];
				}
				if($(item_obj.innerInputObject).is(':visible')){
					if($(evt.target)[0] != $(item_obj.innerInputObject)[0]){
						// Cancel
						$(item_obj.innerInputObject).hide();
						$(item_obj.labelObject).show();
						return;
					}
				}
				// Check event source
				if(item_obj.innerInputObject != null && $(item_obj.innerInputObject).get(0) == $(evt.target).get(0)){
					return true;
				}
				// Hide the label
				$(item_obj.labelObject).hide();
				// Show the textbox, and focus to it
				$(item_obj.innerInputObject).show();
				$(item_obj.innerInputObject).focus();
			});
			$text.keypress( function(evt){
				if(evt.which == 13){ // Enter
					var $text = $(evt.target);
					var id = $($(this).parents('.popup_dropdown_box')[0]).data('hoverDropdownBoxId');
					var item_key = $($(this).parents('.list_item')[0]).data('hoverDropdownBoxBoxItemKey');				
					if(item_key == 'footer'){
						item_obj = hoverDropdownBoxs[id].footerItem;
					} else {
						item_obj = hoverDropdownBoxs[id].items[item_key];
					}
					if(hoverDropdownBoxs[id].options.onTextInput != null){
						// options.onTextInput(value, item_key, item_object, dom_object)
						(hoverDropdownBoxs[id].options.onTextInput)( $text.val(), item_key, item_obj, this );
					}
					// Hide the textbox
					$(item_obj.innerInputObject).hide();
					// Show the label
					$(item_obj.labelObject).show();
					return false;
				} else if(evt.keyCode == 27){ // ESC
					// Cancel
					$(item_obj.innerInputObject).hide();
					$(item_obj.labelObject).show();
				}
			});
			this.dom.append($text);
			this.innerInputObject = $text;
		}
	};

	// Getter of input object
	hoverDropdownBoxItem.prototype.getInputObject = function( ){
		if(this.innerInputObject){
			return this.innerInputObject;
		}
		return null;
	};

	// Getter and Setter for isChecked of input object
	hoverDropdownBoxItem.prototype.checked = function( value ){
		if(this.innerInputObject){
			if(value != null && value == true){
				//$(this.innerInputObject[0]).prop('checked', true);
				$(this.innerInputObject[0]).data('isChecked', true);
				// Drawing custom checkbox
				$(this.innerInputObject[0]).addClass('checkbox_checked');
			} else if(value != null && value == false){
				//$(this.innerInputObject[0]).prop('checked', null);
				$(this.innerInputObject[0]).data('isChecked', false);
				// Drawing custom checkbox
				$(this.innerInputObject[0]).removeClass('checkbox_checked');
			}

			//return $(this.innerInputObject[0]).is(':checked');
			return $(this.innerInputObject[0]).data('isChecked');
		}
	};

	// Getter and Setter for value of input object
	hoverDropdownBoxItem.prototype.value = function( value ){
		if(this.innerInputObject){
			if(value != null){
				$(this.innerInputObject[0]).val(value);
			}
			return $(this.innerInputObject[0]).val();
		}
	};

	/**
		Definitions of jQuery plugin
	**/
	$.fn.hoverDropdownBox = function(config){
		var defaults = {
			isInline: true
		};
		var options = $.extend(defaults, config);
		return this.each(function(i){
			var obj = new hoverDropdownBox( $(this), options );
		});
	};

	$.fn.appendHoverDropdownBox = function(config){
		var defaults = {
			isInline:false
		};
		var options = $.extend(defaults, config);
		return this.each(function(i){
			var obj = new hoverDropdownBox( $(this), options );
		});
	};
})(jQuery);