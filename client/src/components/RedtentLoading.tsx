import React from "react";

const trailingLetters = ["e", "d", "t", "e", "n", "t"];

export function RedtentLoading() {
  return <div className="redtent-loader warm-canvas" role="status" aria-label="Loading Redtent">
    <div className="redtent-loader__glow" aria-hidden="true" />
    <div className="redtent-loader__content">
      <div className="redtent-loader__word" aria-hidden="true"><span className="redtent-loader__lead">R</span><span className="redtent-loader__tail">{trailingLetters.map((letter, index) => <span key={`${letter}-${index}`} className="redtent-loader__letter" style={{ "--loader-letter-index": index } as React.CSSProperties}>{letter}</span>)}</span></div>
      <p className="redtent-loader__caption">Making space for your story</p>
    </div>
  </div>;
}
