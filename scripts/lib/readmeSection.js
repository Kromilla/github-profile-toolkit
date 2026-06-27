const fs = require('fs');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSection(content, startMarker, endMarker) {
  const regex = new RegExp(`${escapeRegExp(startMarker)}\\n([\\s\\S]*?)\\n${escapeRegExp(endMarker)}`);
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function replaceSection(content, startMarker, endMarker, sectionBody) {
  const regex = new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`);

  if (!regex.test(content)) {
    throw new Error(`Section markers not found: ${startMarker}`);
  }

  return content.replace(regex, `${startMarker}\n${sectionBody}\n${endMarker}`);
}

function updateReadmeSection({
  readmePath,
  startMarker,
  endMarker,
  sectionBody,
}) {
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const currentSection = extractSection(readmeContent, startMarker, endMarker);

  if (currentSection === sectionBody) {
    return { changed: false, readmePath };
  }

  const updatedContent = replaceSection(readmeContent, startMarker, endMarker, sectionBody);
  fs.writeFileSync(readmePath, updatedContent);

  return { changed: true, readmePath };
}

module.exports = {
  extractSection,
  replaceSection,
  updateReadmeSection,
};
