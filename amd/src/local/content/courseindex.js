// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Grid format course index enhancements.
 *
 * @module     format_grid/local/content/courseindex
 * @copyright  Catalyst IT Australia 2025
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getString} from 'core/str';
import Log from 'core/log';

const SELECTORS = {
    COURSE_INDEX: '.courseindex',
    SECTION_LIST: 'ul[role="tree"]',
    LINK_CONTAINER: '#format-grid-course-home-link',
};

/**
 * Initialize the course home link.
 *
 * @param {Number} courseId The course ID
 * @param {Boolean} showLink Whether to show the link
 */
export const init = (courseId, showLink) => {
    if (!showLink || !courseId) {
        return;
    }

    const executeInit = () => {
        addCourseHomeLink(courseId);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeInit);
    } else {
        executeInit();
    }
};

/**
 * Add the course home link to the course index.
 *
 * @param {Number} courseId The course ID
 */
const addCourseHomeLink = (courseId) => {
    const courseIndex = document.querySelector(SELECTORS.COURSE_INDEX);

    if (!courseIndex) {
        Log.debug('Grid format: Course index not found');
        return;
    }

    // Check if link already exists
    if (document.querySelector(SELECTORS.LINK_CONTAINER)) {
        Log.debug('Grid format: Course home link already exists');
        return;
    }

    insertCourseHomeLink(courseId, courseIndex);
};

/**
 * Insert the course home link into the course index.
 *
 * @param {Number} courseId The course ID
 * @param {HTMLElement} courseIndex The course index container
 */
const insertCourseHomeLink = async(courseId, courseIndex) => {
    try {
        const courseWord = await getString('course', 'moodle');
        const linkText = await getString('backtocourse', 'format_grid', courseWord);
        const linkContainer = createLinkElement(courseId, linkText);
        const sectionList = courseIndex.querySelector(SELECTORS.SECTION_LIST);

        if (sectionList) {
            // Insert at the beginning of the list
            const firstSection = sectionList.firstElementChild;
            if (firstSection) {
                sectionList.insertBefore(linkContainer, firstSection);
            } else {
                sectionList.appendChild(linkContainer);
            }
        } else {
            // Fallback to original method if structure is different
            const insertBefore = courseIndex.firstElementChild;
            if (insertBefore) {
                courseIndex.insertBefore(linkContainer, insertBefore);
            } else {
                courseIndex.appendChild(linkContainer);
            }
        }

        Log.debug('Grid format: Course home link added successfully');
    } catch (error) {
        Log.error('Grid format: Error adding course home link');
        Log.error(error);
    }
};

/**
 * Create the course home link element.
 *
 * @param {Number} courseId The course ID
 * @param {String} linkText The link text
 * @returns {HTMLElement}
 */
const createLinkElement = (courseId, linkText) => {
    const courseUrl = `${M.cfg.wwwroot}/course/view.php?id=${courseId}`;

    // Create list item container to match Moodle's structure
    const listItem = document.createElement('li');
    listItem.id = 'format-grid-course-home-link';
    listItem.className = 'courseindex-item courseindex-section';
    listItem.setAttribute('data-for', 'course_home');
    listItem.setAttribute('data-id', '0');
    listItem.setAttribute('role', 'treeitem');
    listItem.setAttribute('aria-selected', 'false');

    const anchor = document.createElement('a');
    anchor.href = courseUrl;
    anchor.className = 'courseindex-link text-truncate';
    anchor.setAttribute('data-action', 'togglecourseindexsection');
    anchor.setAttribute('tabindex', '-1');

    const contentSpan = document.createElement('span');
    contentSpan.className = 'courseindex-item-content d-flex courseindex-section-title';
    contentSpan.setAttribute('tabindex', '-1');

    const textSpan = document.createElement('span');
    textSpan.setAttribute('tabindex', '-1');
    textSpan.textContent = linkText;

    contentSpan.appendChild(textSpan);
    anchor.appendChild(contentSpan);
    listItem.appendChild(anchor);

    return listItem;
};