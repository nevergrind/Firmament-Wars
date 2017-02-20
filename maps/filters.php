<?php
   echo '<defs>
	<filter id="filterGlow" x="-150%" y="-150%" height="300%" width="300%">
		<feGaussianBlur result="blurOut1" in="offOut" stdDeviation="2" />
		<feGaussianBlur result="blurOut2" in="offOut" stdDeviation="4" />
		<feGaussianBlur result="blurOut3" in="offOut" stdDeviation="8" />
		<feMerge>
			<feMergeNode in="blurOut1" mode="normal"/>
			<feMergeNode in="blurOut2" mode="normal"/>
			<feMergeNode in="SourceGraphic" mode="normal"/> 
			<feComposite operator="in" in2="SourceGraphic"/> 
		</feMerge>
	</filter>
	
	<filter id="innerGlow" x0="-50%" y0="-50%" width="200%" height="200%">
		<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"></feGaussianBlur>
			<feOffset dy="2" dx="3"></feOffset>
			<feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>
			
           <feFlood flood-color="#ffffff" flood-opacity="0.75"></feFlood>
		   <feComposite in2="shadowDiff" operator="in"></feComposite>
		   <feComposite in2="SourceGraphic" operator="over" result="firstfilter"></feComposite>
          
          
          <feGaussianBlur in="firstfilter" stdDeviation="3" result="blur2"></feGaussianBlur>
			<feOffset dy="-2" dx="-3"></feOffset>
			<feComposite in2="firstfilter" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>
			
           <feFlood flood-color="#ffffff" flood-opacity="0.75"></feFlood>
			<feComposite in2="shadowDiff" operator="in"></feComposite>
			<feComposite in2="firstfilter" operator="over"></feComposite>
	</filter>
	
	<pattern id="smallGrid" width="22" height="22" patternUnits="userSpaceOnUse">
		<path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(32, 64, 96, 1)" stroke-width="2" />
	</pattern>
	
</defs>
<rect id="grid" fill="url(#smallGrid)" width="100%" height="100%" />
';