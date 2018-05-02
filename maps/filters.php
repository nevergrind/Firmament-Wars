<?php
   echo
'<defs>
	<filter id="emboss" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">  
		<feGaussianBlur 
			in="SourceAlpha" 
			result="result0" 
			stdDeviation="2"></feGaussianBlur>        
		<feSpecularLighting 
			in="result0" 
			result="result1" 
			lighting-color="#fff" 
			surfaceScale="10" 
			specularConstant="1" 
			specularExponent="25">  
			  <feDistantLight azimuth="235" elevation="45"></feDistantLight>  
		 </feSpecularLighting>  
		 <feComposite 
			k2="1" 
			k3="1" 
			in="SourceGraphic" 
			result="result4" 
			operator="arithmetic"></feComposite>  
		 <feComposite 
			in2="SourceAlpha" 
			in="result4" 
			result="result2" 
			operator="in"></feComposite>  
	</filter>
	<pattern id="smallGrid" width="22" height="22" patternUnits="userSpaceOnUse">
		<path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(32, 64, 96, 1)" stroke-width="2" />
	</pattern>
	
</defs>
<rect id="grid" fill="url(#smallGrid)" width="100%" height="100%" />';


/*


<filter id="Bevel" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
    <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.1" specularExponent="10" result="specOut" lighting-color="#777">
      <fePointLight x="-5000" y="-10000" z="20000"/>
    </feSpecularLighting>

    <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
    <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
  </filter>

  <filter id="Bevel2" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="150%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
    <feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.5" specularExponent="10" result="specOut" lighting-color="white">
      <fePointLight x="-5000" y="-10000" z="0000"/>
    </feSpecularLighting>
    <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
    <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
  </filter>

  <rect width="100" height="40" filter="url(#Bevel)" />
  <rect y="50" width="100" height="40" filter="url(#Bevel2)" />

  <filter id="lightMe1">
    <feDiffuseLighting in="SourceGraphic" result="light"
        lighting-color="white">
      <fePointLight x="150" y="60" z="20" />
    </feDiffuseLighting>

    <feComposite in="SourceGraphic" in2="light"
                 operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
  </filter>

	<filter id="glow" x="-50%" y="-50%" height="200%" width="200%">
		<feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
		<feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />
		<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
	</filter>

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

 */