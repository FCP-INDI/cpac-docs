import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: true });

document.addEventListener("DOMContentLoaded", function() {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (!h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);

  window.addEventListener("load", () => {
    toggleScrolled();
    loadNodeblockContent();
  });

  function loadNodeblockContent() {
    const yamlDirectory = '../../assets/content/pages/neuroimaging/nodeblock_descriptors';
    const yamlFiles = [
      'anat_preproc.yaml',
      'func_preproc.yaml'
    ];

    const nodeblocksContainer = document.querySelector('.nodeblocks');

    if (nodeblocksContainer) {
      const contentContainer = document.createElement('div');

      yamlFiles.forEach((fileName) => {
        fetch(`${yamlDirectory}/${fileName}`)
          .then(response => response.text())
          .then(yamlContent => {
            const parsedYaml = jsyaml.load(yamlContent);

            // Add a div to display the file name
            const fileNameDiv = document.createElement('h4');
            fileNameDiv.classList.add('file-name');
            fileNameDiv.textContent = fileName;
            fileNameDiv.style.fontWeight = 'bold';
            contentContainer.appendChild(fileNameDiv);

            for (let stepName in parsedYaml.steps) {
              const step = parsedYaml.steps[stepName];

              if (step.description) {
                const stepTitleElement = document.createElement('h4');
                stepTitleElement.textContent = stepName; 

                const stepDescriptionElement = document.createElement('p');
                stepDescriptionElement.textContent = step.description; 

                contentContainer.appendChild(stepTitleElement);
                contentContainer.appendChild(stepDescriptionElement);
              }

              for (let methodName in step.methods) {
                const methodDetails = step.methods[methodName];

                if (methodDetails.description || methodDetails.operations) {
                  const methodTitleElement = document.createElement('h4');
                  methodTitleElement.textContent = methodName; 

                  const methodDescriptionElement = document.createElement('p');
                  methodDescriptionElement.textContent = methodDetails.description || 'No description available';  

                  contentContainer.appendChild(methodTitleElement);
                  contentContainer.appendChild(methodDescriptionElement);

                  if (methodDetails.operations) {
                    const mermaidContainer = document.createElement('div');
                    mermaidContainer.classList.add('mermaid');
                    mermaidContainer.textContent = methodDetails.operations; 

                    contentContainer.appendChild(mermaidContainer);

                    mermaid.init();
                  }
                }

                if (methodDetails.references) {
                  const referencesTitleElement = document.createElement('h5');
                  referencesTitleElement.textContent = 'References';

                  const referencesList = document.createElement('ul');
                  methodDetails.references.forEach(ref => {
                    const referenceItem = document.createElement('li');
                    const referenceLink = document.createElement('a');
                    referenceLink.href = ref;
                    referenceLink.textContent = ref;
                    referenceItem.appendChild(referenceLink);
                    referencesList.appendChild(referenceItem);
                  });

                  contentContainer.appendChild(referencesTitleElement);
                  contentContainer.appendChild(referencesList);
                }

                if (methodDetails.source) {
                  const sourceTitleElement = document.createElement('h5');
                  sourceTitleElement.textContent = 'Source';

                  const sourceList = document.createElement('ul');
                  for (let sourceName in methodDetails.source) {
                    const sourceItem = document.createElement('li');
                    const sourceLink = document.createElement('a');
                    sourceLink.href = methodDetails.source[sourceName];
                    sourceLink.textContent = sourceName;
                    sourceItem.appendChild(sourceLink);
                    sourceList.appendChild(sourceItem);
                  }

                  contentContainer.appendChild(sourceTitleElement);
                  contentContainer.appendChild(sourceList);
                }

                if (methodDetails.validation) {
                  const validationTitleElement = document.createElement('h5');
                  validationTitleElement.textContent = 'Validation';

                  const validationLink = document.createElement('a');
                  validationLink.href = methodDetails.validation;
                  validationLink.textContent = methodDetails.validation;

                  contentContainer.appendChild(validationTitleElement);
                  contentContainer.appendChild(validationLink);
                }
              }
            }
          })
          .catch(error => console.error(`Failed to load YAML file: ${fileName}`, error));
      });

      nodeblocksContainer.appendChild(contentContainer);
    }
  }
});
