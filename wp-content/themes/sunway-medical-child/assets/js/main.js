/**
 * Sunway Medical Center — small interactions.
 *
 * 1. Article topic filter chips
 * 2. New / returning patient segmented control
 * 3. Back-to-top button
 * 4. Prefill the appointment form from the home-page quick booking bar
 * 5. Sensible date limits on appointment forms
 */
(function () {
	'use strict';

	var ready = function (fn) {
		if (document.readyState !== 'loading') {
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	};

	/* ------------------------------------------------------------------
	 * 1. Article filters
	 * ------------------------------------------------------------------ */
	function initArticleFilters() {
		var chips = document.querySelectorAll('.smc-filter [data-filter]');
		if (!chips.length) {
			return;
		}

		var cards = document.querySelectorAll('.smc-article-card');

		var topicOf = function (card) {
			if (card.getAttribute('data-topic')) {
				return card.getAttribute('data-topic');
			}
			var match = Array.prototype.find.call(card.classList, function (name) {
				return name.indexOf('topic-') === 0;
			});
			return match ? match.replace('topic-', '') : 'all';
		};

		chips.forEach(function (chip) {
			chip.addEventListener('click', function () {
				var filter = chip.getAttribute('data-filter');

				chips.forEach(function (other) {
					other.classList.remove('is-active');
					other.setAttribute('aria-pressed', 'false');
				});
				chip.classList.add('is-active');
				chip.setAttribute('aria-pressed', 'true');

				cards.forEach(function (card) {
					var show = filter === 'all' || topicOf(card) === filter;
					card.classList.toggle('is-hidden', !show);
				});
			});
		});
	}

	/* ------------------------------------------------------------------
	 * 2. New / returning patient toggle
	 * ------------------------------------------------------------------ */
	function initPatientToggle() {
		var groups = document.querySelectorAll('.smc-toggle');
		groups.forEach(function (group) {
			var inputs = group.querySelectorAll('input[type="radio"]');
			var sync = function () {
				inputs.forEach(function (input) {
					var label = input.closest('label');
					if (label) {
						label.classList.toggle('is-checked', input.checked);
					}
				});
			};
			inputs.forEach(function (input) {
				input.addEventListener('change', sync);
			});
			sync();
		});
	}

	/* ------------------------------------------------------------------
	 * 3. Back to top
	 * ------------------------------------------------------------------ */
	function initBackToTop() {
		if (document.querySelector('.smc-back-to-top')) {
			return;
		}

		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'smc-back-to-top';
		button.setAttribute('aria-label', 'Back to top');
		button.innerHTML =
			'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

		document.body.appendChild(button);

		var toggle = function () {
			button.classList.toggle('is-visible', window.scrollY > 480);
		};

		window.addEventListener('scroll', toggle, { passive: true });
		toggle();

		button.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	/* ------------------------------------------------------------------
	 * 4. Prefill appointment form from ?department=&doctor=&date=&time=
	 * ------------------------------------------------------------------ */
	function setFieldValue(field, value) {
		if (!field || value === null || value === '') {
			return;
		}

		if (field.tagName === 'SELECT') {
			var wanted = String(value).toLowerCase();
			var matched = false;
			Array.prototype.forEach.call(field.options, function (option) {
				if (
					option.value.toLowerCase() === wanted ||
					option.textContent.trim().toLowerCase() === wanted
				) {
					field.value = option.value;
					matched = true;
				}
			});
			if (!matched) {
				return;
			}
		} else {
			field.value = value;
		}

		field.dispatchEvent(new Event('input', { bubbles: true }));
		field.dispatchEvent(new Event('change', { bubbles: true }));
	}

	function initAppointmentPrefill() {
		var params = new URLSearchParams(window.location.search);
		if (!['department', 'doctor', 'date', 'time'].some(function (key) { return params.has(key); })) {
			return;
		}

		var form = document.querySelector('.wpcf7 form, form.wpcf7-form');
		if (!form) {
			return;
		}

		var map = {
			department: ['department', 'your-department'],
			doctor: ['doctor', 'preferred-doctor'],
			date: ['date', 'preferred-date', 'appointment-date'],
			time: ['time', 'preferred-time', 'appointment-time']
		};

		Object.keys(map).forEach(function (key) {
			if (!params.has(key)) {
				return;
			}
			var value = params.get(key);
			map[key].some(function (name) {
				var field = form.querySelector('[name="' + name + '"]');
				if (field) {
					setFieldValue(field, value);
					return true;
				}
				return false;
			});
		});
	}

	/* ------------------------------------------------------------------
	 * 5. Date limits
	 * ------------------------------------------------------------------ */
	function initDateLimits() {
		var today = new Date();
		var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
			.toISOString()
			.slice(0, 10);

		document.querySelectorAll('.wpcf7 input[type="date"], .smc-booking-form input[type="date"]').forEach(function (input) {
			input.setAttribute('min', iso);
		});
	}

	/* ------------------------------------------------------------------
	 * Boot
	 * ------------------------------------------------------------------ */
	ready(function () {
		initArticleFilters();
		initPatientToggle();
		initBackToTop();
		initAppointmentPrefill();
		initDateLimits();

		document.addEventListener('wpcf7mailsent', function (event) {
			var form = event.target.closest('.wpcf7');
			if (form) {
				form.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		});
	});
})();
