const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

// Helper function to replace placeholders in a file
async function replaceInFile(filePath, replacements) {
  try {
    let content = await fs.readFile(filePath, "utf-8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${placeholder}}}`, "g");
      content = content.replace(regex, value);
    }
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Helper function to get git username
function getGitUserName() {
  try {
    return execSync("git config user.name").toString().trim();
  } catch (e) {
    console.warn("Could not get git username.");
    return "";
  }
}

async function main() {
  console.log("🚀 Initializing your new Django Modern Admin project...");

  // Dynamically import inquirer
  const { default: inquirer } = await import("inquirer");

  const questions = [
    {
      type: "input",
      name: "projectName",
      message: "What is your project's name? (e.g., my-awesome-admin)",
      validate: (input) =>
        /^[a-z0-9-_]+$/.test(input)
          ? true
          : "Please use lowercase letters, numbers, hyphens, and underscores only.",
    },
    {
      type: "input",
      name: "projectDescription",
      message: "Enter a short project description:",
    },
    {
      type: "input",
      name: "author",
      message: "Who is the author of this project?",
      default: getGitUserName(),
    },
    {
      type: "input",
      name: "repositoryUrl",
      message: "What is the full URL of your new repository?",
      validate: (input) =>
        input.startsWith("https://") || input.startsWith("git@")
          ? true
          : "Please enter a valid repository URL.",
    },
  ];

  const answers = await inquirer.prompt(questions);

  const replacements = {
    PROJECT_NAME: answers.projectName,
    PROJECT_DESCRIPTION: answers.projectDescription,
    PROJECT_AUTHOR: answers.author,
    REPOSITORY_URL: answers.repositoryUrl,
  };

  const filesToUpdate = ["package.json", "lib/config.ts", "README.md"];

  console.log("🔄 Updating project files...");

  for (const file of filesToUpdate) {
    await replaceInFile(path.join(__dirname, file), replacements);
    console.log(` ✓ Updated ${file}`);
  }

  // Clean up by removing the setup script itself
  try {
    await fs.unlink(path.join(__dirname, "setup.js"));
    console.log(" ✓ Removed setup script.");
  } catch (error) {
    console.error("Error removing setup script:", error);
  }

  console.log(
    "\n🎉 Project initialization complete! You can now commit the changes."
  );
  console.log("Next steps:");
  console.log("1. Review the changes made to the files.");
  console.log(
    "2. Commit the changes to your repository: git add . && git commit -m 'Initial project setup'"
  );
  console.log("3. Run `npm run dev` to start the development server.");
}

main().catch((error) => {
  console.error("An error occurred during setup:", error);
  process.exit(1);
});
