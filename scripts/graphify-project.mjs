import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Simple glob-to-regex for .graphifyignore
function globToRegex(glob) {
  let escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  escaped = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

function loadIgnoreRules() {
  const ignorePath = path.join(rootDir, '.graphifyignore');
  if (!fs.existsSync(ignorePath)) return [];
  
  return fs.readFileSync(ignorePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(rule => {
      // Handle directory rules (trailing slash)
      const isDir = rule.endsWith('/');
      const pattern = isDir ? rule.slice(0, -1) : rule;
      return { pattern, isDir, regex: globToRegex(pattern) };
    });
}

const ignoreRules = loadIgnoreRules();

function isIgnored(name, isDirectory) {
  return ignoreRules.some(rule => {
    if (rule.isDir && !isDirectory) return false;
    return rule.regex.test(name) || name === rule.pattern;
  });
}

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relPath = path.relative(rootDir, filePath);
    
    if (isIgnored(file, stat.isDirectory()) || isIgnored(relPath, stat.isDirectory())) {
      continue;
    }

    if (stat.isDirectory()) {
      results.push({
        type: 'directory',
        path: relPath,
        name: file
      });
      walk(filePath, results);
    } else {
      results.push({
        type: 'file',
        path: relPath,
        name: file,
        size: stat.size,
        extension: path.extname(file)
      });
    }
  }
  return results;
}

console.log('Generating Project Knowledge Graph...');
const graph = {
  projectName: 'influencer-marketing-dashboard',
  repository: 'git@github.com:LakshBuilds/influencer-marketing-dashboard.git',
  generatedAt: new Date().toISOString(),
  structure: walk(rootDir)
};

const outputPath = path.join(rootDir, 'project-graph.json');
fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));

console.log(`Successfully generated graph at: ${outputPath}`);
console.log(`Total entities indexed: ${graph.structure.length}`);
