#!/usr/bin/env node
"use strict";
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`>> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  const args = process.argv.slice(2);
  const task = (args[0] || 'deploy_vercel').trim();
  // Load tasks from .automation/tasks.yaml (simple parser, no extra deps)
  const tasksPath = require('path').resolve(__dirname, 'tasks.yaml');
  let yamlTasks = [];
  try {
    const content = require('fs').readFileSync(tasksPath, 'utf8');
    const lines = content.split(/\r?\n/);
    let current = null;
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('id:')) {
        current = t.split(':')[1].trim();
        yamlTasks.push({ id: current, command: '' });
      } else if (t.startsWith('command:') && current) {
        const raw = t.split(':')[1].trim();
        // remove surrounding quotes if present
        const cmd = raw.match(/"(.*)"/) ? raw.match(/"(.*)"/)[1] : raw;
        yamlTasks[yamlTasks.length - 1].command = cmd;
      }
    }
  } catch {
    // ignore if no tasks.yaml
  }
  const matched = yamlTasks.find(t => t.id === task);
  if (matched && matched.command) {
    run(matched.command);
    return;
  }
  // Environment vars (must be provided in CI secrets)
  const env = {
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  };
  // Simple validation
  if (!env.VERCEL_TOKEN && task === 'deploy_vercel') {
    console.error('VERCEL_TOKEN is required for deploy_vercel');
    process.exit(1);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.warn('Supabase URL/Anon key not provided; Supabase-related tasks may fail.');
  }

  if (task === 'deploy_vercel') {
    // Run Vercel prod deploy
    const vercelCmd = 'npx vercel --prod';
    run(vercelCmd);
    return;
  }
  if (task === 'check_supabase') {
    // A minimal check of Supabase presence (no migrations here)
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set to check Supabase.');
      process.exit(1);
    }
    // Simple node snippet to ping Supabase
    const code = `const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('${env.SUPABASE_URL}', '${env.SUPABASE_ANON_KEY}');
supabase.from('documents').select('*').limit(1).then(r => { console.log('Supabase test result:', r); process.exit(r.error ? 1 : 0); }).catch(e => { console.error(e); process.exit(1); });`;
    run(`node -e "${code.replace(/"/g, '\\"')}"`);
    return;
  }
  console.error(`Unknown task: ${task}`);
  process.exit(1);
}

main();
