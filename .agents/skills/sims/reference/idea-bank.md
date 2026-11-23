# Course-Inspired Simulation Idea Bank

Use this when the user asks for more simulations, curriculum-like coverage, or ideas from university material. Pick one small concept and make it directly manipulable.

## Selection Heuristic

Good candidates have:
- a variable the learner can change,
- a visible state transition,
- a surprising threshold, convergence, or tradeoff,
- an experiment loop: predict, run, compare, reset.

Avoid topics that only produce a static diagram unless the diagram can become draggable, stochastic, or comparative.

## Statistics and Probability

Sources:
- Stanford CS109 schedule: https://web.stanford.edu/class/archive/cs/cs109/cs109.1212/schedule.html
- Berkeley probability/data science overview: https://cdss.berkeley.edu/probability-data-science
- MIT stochastic processes: https://ocw.mit.edu/courses/18-445-introduction-to-stochastic-processes-spring-2015/

Sim ideas:
- Bayes medical test: vary prevalence, sensitivity, specificity; show false positives dominate at low base rates.
- Markov chain mixing: move mass around a transition graph; compare current distribution to stationary distribution.
- Random walk diffusion: many walkers; vary step bias/persistence; show variance growth.
- Monte Carlo area estimation: throw points at a shape; confidence interval narrows with trials.
- Coupon collector: collect rare cards; show long tail of the last missing item.

## Machine Learning and Optimization

Sources:
- Stanford CS229 notes: https://cs229.stanford.edu/main_notes.pdf
- TensorFlow Playground: https://playground.tensorflow.org/

Sim ideas:
- Gradient descent contour map: drag the start, change learning rate/momentum, watch convergence or divergence.
- SGD vs batch: noisy steps versus smooth full-gradient path on the same loss surface.
- Bias/variance fit: polynomial degree slider; show train/test error and overfit wiggle.
- Logistic decision boundary: move points and regularization; boundary updates live.
- Neural net playground-lite: two hidden units, live decision field, activation toggle.

## Systems, Biology, and Differential Equations

Sources:
- MIT SIR/differential-equation notes: https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/
- MIT epidemiological models: https://ocw.mit.edu/courses/res-10-s95-physics-of-covid-19-transmission-fall-2020/resources/video-3-1-epidemiological-models2014disease-spreading-in-a-population/
- MIT Systems Biology stochastic modeling: https://ocw.mit.edu/courses/8-591j-systems-biology-fall-2014/resources/stochastic-modeling/

Sim ideas:
- SIR epidemic: vary transmission/recovery/vaccination; show peak infected and herd threshold.
- Predator-prey: vary interaction rates; phase plot plus population curves.
- Gillespie birth-death: stochastic paths versus deterministic expectation.
- Reaction-diffusion: paint activator/inhibitor; watch patterns emerge.
- Enzyme saturation: substrate slider; Michaelis-Menten curve and molecules side by side.

## Control and Robotics

Sources:
- MIT feedback control calendar: https://ocw.mit.edu/courses/2-14-analysis-and-design-of-feedback-control-systems-spring-2014/pages/calendar/
- Stanford PID lecture: https://web.stanford.edu/class/archive/ee/ee392m/ee392m.1034/Lecture4_PID.pdf
- Stanford robotics overview: https://see.stanford.edu/Course/CS223A/31

Sim ideas:
- PID controller: tune P/I/D on a mass or temperature plant; show overshoot, settling time, and instability.
- Inverted pendulum intuition: move cart target; show why feedback is necessary.
- Robot arm inverse kinematics: drag end effector; joints solve live.
- Root locus toy: drag gain; closed-loop poles move; time response changes.
- Kalman filter: noisy measurements plus hidden true state; tune process/measurement noise.

## AI, Graphs, and Algorithms

Sources:
- Stanford CS221 topics: https://cs221.stanford.edu/
- Stanford CS221 MDP lecture: https://web.stanford.edu/class/archive/cs/cs221/cs221.1196/lectures/mdp1.pdf
- Stanford CS224W PageRank slides: https://snap.stanford.edu/class/cs224w-2020/slides/04-pagerank.pdf
- Harvard CS50 algorithms: https://cs50.harvard.edu/ap/2024/curriculum/x/weeks/3/

Sim ideas:
- MDP gridworld: paint rewards/walls, change discount, run value iteration.
- A* pathfinding: drag start/goal/walls, compare BFS/Dijkstra/A* expansions.
- PageRank random surfer: edit links, vary teleport probability, watch rank mass settle.
- Sorting visualizer: compare selection, insertion, merge; count comparisons/swaps.
- Constraint satisfaction: map coloring with backtracking; show propagation.

## Economics, Networks, and Cities

Sources:
- Existing site sims: `/sims/supply-demand/`, `/sims/options/`
- Fog City Atlas local reference: `/tmp/fog-city-atlas`

Sim ideas:
- Housing filter model: new units at the top, older units filter down; vary construction rate and demand growth.
- Transit headways: vary frequency and transfers; show average wait time and bunching.
- Congestion pricing: route choice, toll slider, social cost.
- Schelling segregation: tolerance slider; local preferences generate global patterns.
- Network cascade: threshold adoption on a graph; seed different nodes.
