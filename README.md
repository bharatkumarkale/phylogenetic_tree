# phylogenetic_tree
JS based visualization of phylogenetic trees

There are 2 versions of the visualization in this repo.
1. Static visualization - just shows the phylogenetic tree
2. Interactive visualization - Shows phylogenetic tree and allows to interactively drill down into the branches

## Static Visualization
1. Clone the repo and navigate to the `./Staic` directory. 
2. Run a simple http server using the following command `python -m http.server`
3. Open a web browser and navigate to http://localhost:8000/phylogeny_radial.html

## Interactive Visualization
1. Clone the repo and naviagate to `./Interactive` directory
2. Create a new conda environment using the `requirements.txt` file. For example: `conda create --name phylogeny --file requirements.txt`
3. Navigate to `./Interactive/Phylogeny` directory
4. Run the following command `python manage.py runserver`
4. Open a web browser and navigate to `http://127.0.0.1:8000/interactive_phylogeny/`