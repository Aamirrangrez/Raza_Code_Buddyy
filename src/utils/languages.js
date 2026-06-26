// src/utils/languages.js
import { createElement } from 'react'
import { FaPython, FaJava } from 'react-icons/fa'
import { SiJavascript, SiC, SiCplusplus, SiGo, SiRust, SiRuby, SiPhp } from 'react-icons/si'
import {
  Box, Repeat, Zap, List, RotateCcw, GitBranch, Type, MousePointer2, ArrowUpDown,
  Blocks, ShieldAlert, Network, Sprout, Rocket
} from 'lucide-react'

const icon = (component, color) => createElement(component, {
  className: "inline align-text-bottom",
  size: "1.2em",
  color: color || "currentColor"
})

export const LANGUAGES = [
  { id: 'python', name: 'Python', icon: icon(FaPython, '#3b82f6'), color: '#3b82f6', monacoId: 'python' },
  { id: 'javascript', name: 'JavaScript', icon: icon(SiJavascript, '#f59e0b'), color: '#f59e0b', monacoId: 'javascript' },
  { id: 'c', name: 'C', icon: icon(SiC, '#22d3ee'), color: '#22d3ee', monacoId: 'c' },
  { id: 'cpp', name: 'C++', icon: icon(SiCplusplus, '#8b5cf6'), color: '#8b5cf6', monacoId: 'cpp' },
  { id: 'java', name: 'Java', icon: icon(FaJava, '#ef4444'), color: '#ef4444', monacoId: 'java' },
  { id: 'go', name: 'Go', icon: icon(SiGo, '#0ea5e9'), color: '#0ea5e9', monacoId: 'go' },
  { id: 'rust', name: 'Rust', icon: icon(SiRust, '#f97316'), color: '#f97316', monacoId: 'rust' },
  { id: 'ruby', name: 'Ruby', icon: icon(SiRuby, '#e11d48'), color: '#e11d48', monacoId: 'ruby' },
  { id: 'php', name: 'PHP', icon: icon(SiPhp, '#6366f1'), color: '#6366f1', monacoId: 'php' },
]

export const STARTER_CODE = {
  python: `# Welcome to RazaCodeBuddy! 🚀
# Your interactive coding mentor

def greet(name):
    """A simple greeting function"""
    return f"Hello, {name}! Welcome to RazaCodeBuddy!"

# Try running this code!
message = greet("World")
print(message)

# Let's try something more interesting
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]
print(f"Squares: {squared}")
`,

  javascript: `// Welcome to RazaCodeBuddy! 🚀
// Your interactive coding mentor

function greet(name) {
  return \`Hello, \${name}! Welcome to RazaCodeBuddy!\`;
}

// Try running this code!
const message = greet("World");
console.log(message);

// Let's try something interesting
const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(n => n ** 2);
console.log("Squares:", squared);
`,

  c: `/* Welcome to RazaCodeBuddy! 🚀 */
/* Your interactive coding mentor */

#include <stdio.h>

void greet(char* name) {
    printf("Hello, %s! Welcome to RazaCodeBuddy!\\n", name);
}

int main() {
    // Try running this code!
    greet("World");
    
    // Let's try something interesting
    int numbers[] = {1, 2, 3, 4, 5};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Squares: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i] * numbers[i]);
    }
    printf("\\n");
    
    return 0;
}
`,

  cpp: `// Welcome to RazaCodeBuddy! 🚀
// Your interactive coding mentor

#include <iostream>
#include <vector>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "! Welcome to RazaCodeBuddy!";
}

int main() {
    // Try running this code!
    cout << greet("World") << endl;
    
// Let's try something interesting
    vector<int> numbers = {1, 2, 3, 4, 5};
    
    cout << "Squares: ";
    for (int n : numbers) {
        cout << n * n << " ";
    }
    cout << endl;
    
    return 0;
}
`,

  java: `// Welcome to RazaCodeBuddy! 🚀
// Your interactive coding mentor

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! Welcome to RazaCodeBuddy!");
    }
}
`,

  go: `// Welcome to RazaCodeBuddy! 🚀
// Your interactive coding mentor

package main

import "fmt"

func main() {
    fmt.Println("Hello, World! Welcome to RazaCodeBuddy!")
}
`,

  rust: `// Welcome to RazaCodeBuddy! 🚀
// Your interactive coding mentor

fn main() {
    println!("Hello, World! Welcome to RazaCodeBuddy!");
}
`,

  ruby: `# Welcome to RazaCodeBuddy! 🚀
# Your interactive coding mentor

puts "Hello, World! Welcome to RazaCodeBuddy!"
`,

  php: `<?php
// Welcome to RazaCodeBuddy! 🚀
// Your interactive coding mentor

echo "Hello, World! Welcome to RazaCodeBuddy!\\n";
?>
`
}

export const TOPICS = [
  { id: 'variables', label: 'Variables', icon: icon(Box, '#10b981') },
  { id: 'loops', label: 'Loops', icon: icon(Repeat, '#3b82f6') },
  { id: 'functions', label: 'Functions', icon: icon(Zap, '#f59e0b') },
  { id: 'arrays', label: 'Arrays', icon: icon(List, '#8b5cf6') },
  { id: 'recursion', label: 'Recursion', icon: icon(RotateCcw, '#ec4899') },
  { id: 'conditionals', label: 'Conditionals', icon: icon(GitBranch, '#06b6d4') },
  { id: 'strings', label: 'Strings', icon: icon(Type, '#f97316') },
  { id: 'pointers', label: 'Pointers', icon: icon(MousePointer2, '#ef4444') },
  { id: 'sorting', label: 'Sorting', icon: icon(ArrowUpDown, '#eab308') },
  { id: 'classes', label: 'Classes & OOP', icon: icon(Blocks, '#14b8a6') },
  { id: 'error-handling', label: 'Error Handling', icon: icon(ShieldAlert, '#f43f5e') },
  { id: 'data-structures', label: 'Data Structures', icon: icon(Network, '#8b5cf6') },
]

export const LEARNING_MODES = [
  { id: 'beginner', label: 'Beginner', desc: 'Simple explanations, lots of visuals', icon: icon(Sprout, '#10b981'), xpMultiplier: 1 },
  { id: 'intermediate', label: 'Intermediate', desc: 'Practical examples, some theory', icon: icon(Zap, '#f59e0b'), xpMultiplier: 1.5 },
  { id: 'advanced', label: 'Advanced', desc: 'Complexity analysis, optimization', icon: icon(Rocket, '#ef4444'), xpMultiplier: 2 },
]

export function getLanguageById(id) {
  return LANGUAGES.find(l => l.id === id) || LANGUAGES[0]
}

export function formatMarkdown(text) {
  // Simple markdown formatter for display
  return text
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')
}
