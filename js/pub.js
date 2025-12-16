// Pure function to find author in authors array
function findAuthor(authors, name) {
  for (const i in authors) {
    if (authors[i].name === name) {
      return i;
    }
  }
  return -1;
}

// Pure function to format authors string
function stringOfAuthors(authors, mainAuthor) {
  const text = authors.map(function (author) {
    if (author.name === mainAuthor) {
      return "<b>" + author.name + "</b>, ";
    } else {
      return author.name + ", ";
    }
  }).reduce(function (s1, s2) { return s1 + s2; }, "");

  return text.substring(0, text.length - 2);
}

// Pure function to format publication section
function string_of_publication(str_pub, pub_type, func, name) {
  if (!pub_type || pub_type.length === 0) {
    return "";
  }
  
  return "<h3>" + str_pub + "</h3><ol>" +
    pub_type.filter(
      function (x) { return name === "" || findAuthor(x.authors, name) !== -1; }
    ).sort(function (x, y) { return x.year < y.year; }).map(func)
      .reduce(function (s1, s2) { return s1 + s2; }, "") + "</ol>";
}

// Pure function to construct preprint and online links
function preprint_online(x) {
  let preprint = "";
  let online = "";
  
  if (x.preprint && x.preprint !== "") {
    preprint = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"" + x.preprint + "\">Preprint</a>";
  }
  if (x.online && x.online !== "") {
    online = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"" + x.online + "\">Online</a>";
  }
  
  return [preprint, online];
}

// Format journal publications
function journal(journals, name) {
  return string_of_publication("Journal", journals,
    function (x) {
      const value = preprint_online(x);
      const preprint = value[0];
      const online = value[1];
      return "<br><li>" + stringOfAuthors(x.authors, name) + "<i>. " + x.paper +
        "</i>, " + x.name + ", " + x.issue + " " + x.year + preprint + online + "</li>";
    },
    name
  );
}

// Format conference publications
function conference(conferences, name) {
  return string_of_publication("Conference", conferences,
    function (x) {
      const value = preprint_online(x);
      const preprint = value[0];
      const online = value[1];
      
      if (x.venue && x.venue !== "") {
        return "<br><li>" + stringOfAuthors(x.authors, name) + "<i>. " + x.paper +
          "</i>, " + x.name + ", " + x.venue + ", " + x.year + preprint + online + "</li>";
      } else {
        return "<br><li>" + stringOfAuthors(x.authors, name) + "<i>. " + x.paper +
          "</i>, " + x.name + ", " + x.year + preprint + online + "</li>";
      }
    },
    name
  );
}

// Format workshop publications
function workshop(workshops, name) {
  return string_of_publication("Workshop", workshops,
    function (x) {
      const value = preprint_online(x);
      const preprint = value[0];
      const online = value[1];
      
      if (x.venue && x.venue !== "") {
        return "<br><li>" + stringOfAuthors(x.authors, name) + "<i>. " + x.paper +
          "</i>, " + x.name + ", " + x.venue + ", " + x.year + preprint + online + "</li>";
      } else {
        return "<br><li>" + stringOfAuthors(x.authors, name) + "<i>. " + x.paper +
          "</i>, " + x.name + ", " + x.year + preprint + online + "</li>";
      }
    },
    name
  );
}

// Format technical reports
function techrep(techreps, name) {
  return string_of_publication("Technical Reports", techreps,
    function (x) {
      const value = preprint_online(x);
      const preprint = value[0];
      const online = value[1];
      return "<br><li>" + stringOfAuthors(x.authors, name) + "<i>. " + x.paper +
        "</i>, " + x.year + preprint + online + "</li>";
    },
    name
  );
}

// Load publications data from JSON file
async function loadPublicationsData() {
  try {
    const response = await fetch('../data/publications.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error loading publications data:', error);
    return { 
      success: false, 
      error: error.message,
      fallbackData: {
        conference: [],
        journal: [],
        workshop: [],
        technical_report: []
      }
    };
  }
}

// Display publications with error handling
async function pubs(name) {
  const element = document.getElementById("pubs");
  
  if (!element) {
    console.error('Element with id "pubs" not found');
    return;
  }
  
  // Show loading state
  element.innerHTML = '<p>Loading publications...</p>';
  
  const result = await loadPublicationsData();
  
  if (result.success) {
    const allpubs = result.data;
    const output_text = 
      journal(allpubs.journal || [], name) + 
      conference(allpubs.conference || [], name) + 
      workshop(allpubs.workshop || [], name) + 
      techrep(allpubs.technical_report || [], name);
    
    element.innerHTML = output_text;
  } else {
    // Display user-friendly error message
    element.innerHTML = '<p class="error">Unable to load publications at this time. Please try again later.</p>';
  }
}
