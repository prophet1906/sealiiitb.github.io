// Pure function to shuffle display string
function shuffle(display_string) {
  const items = display_string.split("!");
  const n = items.length;

  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (!items[i].includes("Other projects")) {
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
  }
  return items.join("");
}

// Pure function to filter and format projects
function formatProjects(projects, name) {
  let display_string = "";
  
  if (name !== "") {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].owners === name) {
        display_string += "!<li><a href='" + projects[i].pagelink + "'>" + projects[i].title + "</a></li>";
      }
    }
    return display_string + "</ol>";
  } else {
    for (let i = 0; i < projects.length; i++) {
      display_string += "!<li><a href='" + projects[i].pagelink + "'>" + projects[i].title + "</a></li>";
    }
    return display_string;
  }
}

// Load projects data from JSON file
async function loadProjectsData() {
  try {
    const response = await fetch('../data/projects.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.projects };
  } catch (error) {
    console.error('Error loading projects data:', error);
    return { 
      success: false, 
      error: error.message,
      fallbackData: []
    };
  }
}

// Display projects with error handling
async function projects(name) {
  const element = document.getElementById("projects");
  
  if (!element) {
    console.error('Element with id "projects" not found');
    return;
  }
  
  // Show loading state
  element.innerHTML = '<p>Loading projects...</p>';
  
  const result = await loadProjectsData();
  
  if (result.success) {
    const output_text = formatProjects(result.data, name);
    const shuffled_text = shuffle(output_text);
    element.innerHTML = shuffled_text;
  } else {
    // Display user-friendly error message
    element.innerHTML = '<p class="error">Unable to load projects at this time. Please try again later.</p>';
  }
}
