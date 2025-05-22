console.log("Script.js loaded and running!"); // For testing if the script loads

document.addEventListener('DOMContentLoaded', () => {
    const timelineLinks = document.querySelectorAll('.timeline-navigation li');
    const scenarioSections = document.querySelectorAll('.scenario-section');
    const mainContent = document.querySelector('.main-content');

    // 1. Smooth scroll when a timeline item is clicked
    if (timelineLinks.length && scenarioSections.length && mainContent) {
        timelineLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // e.preventDefault(); // Only needed if timelineLinks were actual <a> tags
                const targetId = link.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    // Calculate position relative to the mainContent scroll container's current scroll top
                    const targetPosition = targetSection.offsetTop; 
                    
                    mainContent.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    // updateActiveLink(targetId); // Let scroll handler do this for consistency
                }
            });
        });
    } else {
        console.error("Timeline navigation, sections, or main content area not found. Scroll/click features might not work.");
    }

    // Helper function to update active timeline link
    function updateActiveLink(activeId) {
        timelineLinks.forEach(link => {
            if (link.getAttribute('data-target') === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 2. Highlight timeline item based on scroll position (using Intersection Observer for sections)
    if (mainContent && scenarioSections.length) {
        const sectionObserverOptions = {
            root: mainContent, // Observe within the main-content scrolling area
            rootMargin: `-${window.innerHeight * 0.49}px 0px -${window.innerHeight * 0.49}px 0px`, // Trigger when middle ~2% of section is in middle of viewport
            threshold: 0.01 // Needs a tiny bit of the section to be visible within rootMargin
        };

        const sectionScrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const visibleSectionId = entry.target.id;
                    updateActiveLink(visibleSectionId);
                }
            });
        }, sectionObserverOptions);

        scenarioSections.forEach(section => {
            if (document.querySelector(`.timeline-navigation li[data-target="${section.id}"]`)) { // Only observe sections that are targets of timeline links
                 sectionScrollObserver.observe(section);
            }
        });
    }


    // 3. Animation for items using Intersection Observer
    const animatedItems = document.querySelectorAll('.animated-item');
    if (animatedItems.length && mainContent) {
        const animationObserverOptions = {
            root: mainContent, 
            rootMargin: '0px 0px -50px 0px', // Trigger when item is 50px from bottom of viewport
            threshold: 0.01 // Trigger as soon as a tiny part enters the viewport within rootMargin
        };

        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Intersection detected for animation:', entry.target); // DEBUG LINE
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, animationObserverOptions);

        animatedItems.forEach(item => {
            animationObserver.observe(item);
        });
    } else if (!mainContent) {
        console.error("Main content area not found for animation observer.");
    }


    // Set initial active state for the first timeline item & potentially animate visible items
    if (timelineLinks.length > 0 && scenarioSections.length > 0 && mainContent) {
        let initialTargetId = null;

        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            const targetSection = document.getElementById(hashId);
            if (targetSection && Array.from(scenarioSections).includes(targetSection)) {
                initialTargetId = hashId;
                // Scroll to section directly without smooth scroll for initial load
                mainContent.scrollTop = targetSection.offsetTop;
            }
        }
        
        if (!initialTargetId) {
            initialTargetId = timelineLinks[0].getAttribute('data-target');
            mainContent.scrollTop = 0; // Ensure scrolled to top
        }

        if(initialTargetId) {
            updateActiveLink(initialTargetId);
        }
        
        // Manually check animated items that might be visible on load
        // Small delay to ensure layout is stable
        setTimeout(() => {
            animatedItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const mainContentRect = mainContent.getBoundingClientRect();
                // Check if the item is within the visible bounds of the mainContent container
                if (
                    itemRect.top < (mainContentRect.top + mainContent.clientHeight) &&
                    itemRect.bottom > mainContentRect.top &&
                    itemRect.left < (mainContentRect.left + mainContent.clientWidth) &&
                    itemRect.right > mainContentRect.left
                ) {
                     // Check if it meets a threshold-like condition (e.g. top part visible)
                    if (itemRect.top < (mainContentRect.top + mainContent.clientHeight * 0.95)) { // 95% from top of mainContent visible area
                        if (!item.classList.contains('is-visible')) {
                             console.log('Initially visible item made active:', item); // DEBUG LINE
                             item.classList.add('is-visible');
                             // We find the observer that was supposed to watch this item.
                             // This is a bit tricky as the observer is scoped.
                             // For simplicity, we'll rely on the main observer to unobserve if it later fires
                             // Or, if animationObserver is accessible here, call unobserve.
                             // This manual check is a fallback.
                        }
                    }
                }
            });
        }, 100); // 100ms delay

    }
});