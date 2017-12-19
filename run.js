var lastRun = null;
let tenMinsInMs = 600000;

function processStories() {
    console.log('Processing stories');
    let stories = document.getElementsByClassName('story finished');
    for (var i = 0; i < stories.length; i++) {
        var url = checkStoryTitleForGithubLink(stories[i]);
        if (url != null) {
            checkIfPrIsMerged(stories[i], url);
        }
    }
}

function checkStoryTitleForGithubLink(story) {
    var storyHeader = story.getElementsByTagName('header');
    if (storyHeader.length > 0) {
        // Successful run - save the time
        lastRun = new Date();
        var storyTitle = storyHeader[0].innerHTML;
        var githubUrl = extractGithubUrl(storyTitle);
        if (githubUrl) {
            return githubUrl;
        }
    }
    return null;
}

function extractGithubUrl(storyTitle) {
    var expression = /https:\/\/github\.com(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    var matches = storyTitle.match(regex);
    if (matches && matches.length > 0) {
        return matches[0];
    }
    return null;
}

function checkIfPrIsMerged(story, url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'document';
    xhr.open('GET', url, true);
    xhr.onload = function(e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var state = xhr.responseXML.getElementsByClassName('State');
                if (state.length > 0) {
                    if (state[0].innerHTML.indexOf('Merged') > -1) {
                        highlightStory(story);
                    }
                }
            }
        }
    };
    xhr.send();
}

function highlightStory(story) {
    var header = story.getElementsByClassName('preview');
    if (header.length > 0) {
        header[0].style.backgroundColor = '#f19600';
        header[0].style.fontWeight = 600;
    }
    var button = story.getElementsByClassName('state button deliver');
    if (button.length > 0) {
        button[0].innerHTML = 'Merged';
        button[0].style.backgroundColor = '#fff';
        button[0].style.color = '#333';
        button[0].style.fontWeight = 800;
    }
}

setInterval(function() {
    // Check if we successfully ran in the last 10 minutes
    if (lastRun == null || (new Date() - lastRun) > tenMinsInMs) {
        processStories();
    }
}, 10000);
